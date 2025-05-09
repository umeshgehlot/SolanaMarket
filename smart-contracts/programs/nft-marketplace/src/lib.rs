use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use solana_program::program_option::COption;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod nft_marketplace {
    use super::*;
    
    // Events for tracking marketplace actions
    #[event]
    pub struct BidPlaced {
        pub bidder: Pubkey,
        pub mint: Pubkey,
        pub price: u64,
        pub expires_at: i64,
    }

    #[event]
    pub struct BidAccepted {
        pub bidder: Pubkey,
        pub seller: Pubkey,
        pub mint: Pubkey,
        pub price: u64,
    }

    #[event]
    pub struct BidCancelled {
        pub bidder: Pubkey,
        pub mint: Pubkey,
        pub price: u64,
    }

    // Initialize a new marketplace
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        marketplace_fee: u64,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.fee = marketplace_fee;
        marketplace.treasury = ctx.accounts.treasury.key();
        marketplace.bump = *ctx.bumps.get("marketplace").unwrap();

        msg!("Marketplace initialized with fee: {}", marketplace_fee);
        Ok(())
    }

    // List an NFT for sale
    pub fn list(
        ctx: Context<ListNft>,
        price: u64,
        auction_house_fee: u64,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.mint = ctx.accounts.mint.key();
        listing.price = price;
        listing.active = true;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = *ctx.bumps.get("listing").unwrap();

        msg!("NFT listed for sale at price: {}", price);
        Ok(())
    }

    // Cancel a listing
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.active = false;
        
        msg!("Listing cancelled for mint: {}", listing.mint);
        Ok(())
    }

    // Buy an NFT
    pub fn buy(ctx: Context<BuyNft>) -> Result<()> {
        let listing = &ctx.accounts.listing;
        
        // Verify the listing is active
        require!(listing.active, NftMarketplaceError::InactiveListing);
        
        // Calculate fees
        let marketplace = &ctx.accounts.marketplace;
        let marketplace_fee_amount = (listing.price as u128)
            .checked_mul(marketplace.fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        let seller_amount = listing.price.checked_sub(marketplace_fee_amount).unwrap();
        
        // Transfer payment to seller
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
            ),
            seller_amount,
        )?;
        
        // Transfer marketplace fee
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            marketplace_fee_amount,
        )?;
        
        // Transfer NFT to buyer
        let seeds = &[
            b"marketplace".as_ref(),
            &[marketplace.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        anchor_spl::token::transfer(cpi_ctx, 1)?;
        
        // Update listing status
        let listing = &mut ctx.accounts.listing;
        listing.active = false;
        
        msg!("NFT purchased for {} SOL", listing.price);
        Ok(())
    }

    // Create an offer for an NFT
    pub fn make_offer(
        ctx: Context<MakeOffer>,
        price: u64,
        expiry_time: i64,
    ) -> Result<()> {
        let offer = &mut ctx.accounts.offer;
        offer.buyer = ctx.accounts.buyer.key();
        offer.mint = ctx.accounts.mint.key();
        offer.price = price;
        offer.created_at = Clock::get()?.unix_timestamp;
        offer.expires_at = expiry_time;
        offer.active = true;
        offer.bump = *ctx.bumps.get("offer").unwrap();
        
        // Escrow payment
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.escrow.to_account_info(),
                },
            ),
            price,
        )?;
        
        msg!("Offer made for NFT at price: {}", price);
        Ok(())
    }

    // Accept an offer
    pub fn accept_offer(ctx: Context<AcceptOffer>) -> Result<()> {
        let offer = &ctx.accounts.offer;
        
        // Verify the offer is active and not expired
        require!(offer.active, NftMarketplaceError::InactiveOffer);
        require!(
            Clock::get()?.unix_timestamp <= offer.expires_at,
            NftMarketplaceError::ExpiredOffer
        );
        
        // Calculate fees
        let marketplace = &ctx.accounts.marketplace;
        let marketplace_fee_amount = (offer.price as u128)
            .checked_mul(marketplace.fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        let seller_amount = offer.price.checked_sub(marketplace_fee_amount).unwrap();
        
        // Transfer payment from escrow to seller
        let seeds = &[
            b"escrow".as_ref(),
            offer.mint.as_ref(),
            offer.buyer.as_ref(),
            &[offer.bump],
        ];
        let signer = &[&seeds[..]];
        
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
                signer,
            ),
            seller_amount,
        )?;
        
        // Transfer marketplace fee
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
                signer,
            ),
            marketplace_fee_amount,
        )?;
        
        // Transfer NFT to buyer
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        anchor_spl::token::transfer(cpi_ctx, 1)?;
        
        // Update offer status
        let offer = &mut ctx.accounts.offer;
        offer.active = false;
        
        msg!("Offer accepted for NFT at price: {}", offer.price);
        Ok(())
    }

    // Cancel an offer
    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        let offer = &mut ctx.accounts.offer;
        
        // Verify the offer is active
        require!(offer.active, NftMarketplaceError::InactiveOffer);
        
        // Return funds to buyer
        let seeds = &[
            b"escrow".as_ref(),
            offer.mint.as_ref(),
            offer.buyer.as_ref(),
            &[offer.bump],
        ];
        let signer = &[&seeds[..]];
        
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.buyer.to_account_info(),
                },
                signer,
            ),
            offer.price,
        )?;
        
        // Update offer status
        offer.active = false;
        
        msg!("Offer cancelled for NFT");
        Ok(())
    }
    
    // Create a bid for an NFT
    pub fn place_bid(
        ctx: Context<PlaceBid>,
        price: u64,
        expiry_time: i64,
    ) -> Result<()> {
        let bid = &mut ctx.accounts.bid;
        bid.bidder = ctx.accounts.bidder.key();
        bid.mint = ctx.accounts.mint.key();
        bid.price = price;
        bid.created_at = Clock::get()?.unix_timestamp;
        bid.expires_at = expiry_time;
        bid.active = true;
        bid.bump = *ctx.bumps.get("bid").unwrap();
        
        // Escrow payment
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.bidder.to_account_info(),
                    to: ctx.accounts.escrow.to_account_info(),
                },
            ),
            price,
        )?;
        
        // Emit event
        emit!(BidPlaced {
            bidder: bid.bidder,
            mint: bid.mint,
            price: bid.price,
            expires_at: bid.expires_at,
        });
        
        msg!("Bid placed for NFT at price: {}", price);
        Ok(())
    }
    
    // Accept a bid
    pub fn accept_bid(ctx: Context<AcceptBid>) -> Result<()> {
        let bid = &ctx.accounts.bid;
        
        // Verify the bid is active and not expired
        require!(bid.active, NftMarketplaceError::InactiveBid);
        require!(
            Clock::get()?.unix_timestamp <= bid.expires_at,
            NftMarketplaceError::ExpiredBid
        );
        
        // Calculate fees
        let marketplace = &ctx.accounts.marketplace;
        let marketplace_fee_amount = (bid.price as u128)
            .checked_mul(marketplace.fee as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        let seller_amount = bid.price.checked_sub(marketplace_fee_amount).unwrap();
        
        // Transfer payment from escrow to seller
        let seeds = &[
            b"bid_escrow".as_ref(),
            bid.mint.as_ref(),
            bid.bidder.as_ref(),
            &[bid.bump],
        ];
        let signer = &[&seeds[..]];
        
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
                signer,
            ),
            seller_amount,
        )?;
        
        // Transfer marketplace fee
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
                signer,
            ),
            marketplace_fee_amount,
        )?;
        
        // Transfer NFT to bidder
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.bidder_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        anchor_spl::token::transfer(cpi_ctx, 1)?;
        
        // Update bid status
        let bid = &mut ctx.accounts.bid;
        bid.active = false;
        
        // Emit event
        emit!(BidAccepted {
            bidder: bid.bidder,
            seller: ctx.accounts.seller.key(),
            mint: bid.mint,
            price: bid.price,
        });
        
        msg!("Bid accepted for NFT at price: {}", bid.price);
        Ok(())
    }
    
    // Cancel a bid
    pub fn cancel_bid(ctx: Context<CancelBid>) -> Result<()> {
        let bid = &mut ctx.accounts.bid;
        
        // Verify the bid is active
        require!(bid.active, NftMarketplaceError::InactiveBid);
        
        // Return funds to bidder
        let seeds = &[
            b"bid_escrow".as_ref(),
            bid.mint.as_ref(),
            bid.bidder.as_ref(),
            &[bid.bump],
        ];
        let signer = &[&seeds[..]];
        
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.escrow.to_account_info(),
                    to: ctx.accounts.bidder.to_account_info(),
                },
                signer,
            ),
            bid.price,
        )?;
        
        // Update bid status
        bid.active = false;
        
        // Emit event
        emit!(BidCancelled {
            bidder: bid.bidder,
            mint: bid.mint,
            price: bid.price,
        });
        
        msg!("Bid cancelled for NFT");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(marketplace_fee: u64)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 32 + 1,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the treasury account that will receive fees
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(price: u64, auction_house_fee: u64)]
pub struct ListNft<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 32 + 8 + 1 + 8 + 1,
        seeds = [b"listing", mint.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == mint.key(),
        constraint = seller_token_account.amount == 1
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(
        mut,
        seeds = [b"listing", listing.mint.as_ref(), seller.key().as_ref()],
        bump = listing.bump,
        constraint = listing.seller == seller.key(),
        constraint = listing.active
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyNft<'info> {
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(
        mut,
        seeds = [b"listing", listing.mint.as_ref(), seller.key().as_ref()],
        bump = listing.bump,
        constraint = listing.active
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the seller account
    pub seller: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: This is the treasury account
    pub treasury: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == listing.mint,
        constraint = seller_token_account.amount == 1
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(price: u64, expiry_time: i64)]
pub struct MakeOffer<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"offer", mint.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,
    
    #[account(
        init,
        payer = buyer,
        space = 0,
        seeds = [b"escrow", mint.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    /// CHECK: This is the escrow account
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptOffer<'info> {
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(
        mut,
        seeds = [b"offer", offer.mint.as_ref(), offer.buyer.as_ref()],
        bump = offer.bump,
        constraint = offer.active
    )]
    pub offer: Account<'info, Offer>,
    
    #[account(
        mut,
        seeds = [b"escrow", offer.mint.as_ref(), offer.buyer.as_ref()],
        bump
    )]
    /// CHECK: This is the escrow account
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the buyer account
    pub buyer: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: This is the treasury account
    pub treasury: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == offer.mint,
        constraint = seller_token_account.amount == 1
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = buyer_token_account.owner == buyer.key(),
        constraint = buyer_token_account.mint == offer.mint
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelOffer<'info> {
    #[account(
        mut,
        seeds = [b"offer", offer.mint.as_ref(), buyer.key().as_ref()],
        bump = offer.bump,
        constraint = offer.buyer == buyer.key(),
        constraint = offer.active
    )]
    pub offer: Account<'info, Offer>,
    
    #[account(
        mut,
        seeds = [b"escrow", offer.mint.as_ref(), buyer.key().as_ref()],
        bump
    )]
    /// CHECK: This is the escrow account
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub fee: u64,  // in basis points (e.g., 250 = 2.5%)
    pub treasury: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct Offer {
    pub buyer: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub created_at: i64,
    pub expires_at: i64,
    pub active: bool,
    pub bump: u8,
}

#[account]
pub struct Bid {
    pub bidder: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub created_at: i64,
    pub expires_at: i64,
    pub active: bool,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(price: u64, expiry_time: i64)]
pub struct PlaceBid<'info> {
    #[account(
        init,
        payer = bidder,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"bid", mint.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, Bid>,
    
    #[account(
        init,
        payer = bidder,
        space = 0,
        seeds = [b"bid_escrow", mint.key().as_ref(), bidder.key().as_ref()],
        bump
    )]
    /// CHECK: This is the escrow account
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    pub mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptBid<'info> {
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(
        mut,
        seeds = [b"bid", bid.mint.as_ref(), bid.bidder.as_ref()],
        bump = bid.bump,
        constraint = bid.active
    )]
    pub bid: Account<'info, Bid>,
    
    #[account(mut)]
    /// CHECK: This is the escrow account
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    #[account(mut)]
    /// CHECK: This is the bidder account
    pub bidder: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: This is the treasury account
    pub treasury: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.mint == bid.mint,
        constraint = seller_token_account.amount == 1
    )]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = mint,
        associated_token::authority = bidder
    )]
    pub bidder_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CancelBid<'info> {
    #[account(
        mut,
        seeds = [b"bid", bid.mint.as_ref(), bidder.key().as_ref()],
        bump = bid.bump,
        constraint = bid.bidder == bidder.key(),
        constraint = bid.active
    )]
    pub bid: Account<'info, Bid>,
    
    #[account(mut)]
    /// CHECK: This is the escrow account
    pub escrow: AccountInfo<'info>,
    
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum NftMarketplaceError {
    #[msg("The listing is not active")]
    InactiveListing,
    
    #[msg("The offer is not active")]
    InactiveOffer,
    
    #[msg("The offer has expired")]
    ExpiredOffer,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("The bid is not active")]
    InactiveBid,
    
    #[msg("The bid has expired")]
    ExpiredBid,
    
    #[msg("Bid amount is too low")]
    BidTooLow,
    
    #[msg("Only the NFT owner can accept bids")]
    NotNftOwner,
}
