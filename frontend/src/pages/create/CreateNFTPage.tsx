import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import nftService, { CreateNFTParams } from '../../services/nftService';
import useWalletConnection from '../../hooks/useWalletConnection';

// Mock collections for demonstration
const MOCK_COLLECTIONS = [
  { id: '1', name: 'Solana Monkeys', image: 'https://via.placeholder.com/50' },
  { id: '2', name: 'Degenerate Apes', image: 'https://via.placeholder.com/50' },
  { id: '3', name: 'Solana Punks', image: 'https://via.placeholder.com/50' },
  { id: '4', name: 'Magic Eden Gems', image: 'https://via.placeholder.com/50' },
];

interface FormValues {
  name: string;
  description: string;
  collectionId: string;
  royaltyPercentage: number;
  attributes: Array<{ trait_type: string; value: string }>;
}

const CreateNFTPage: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { connected, connect } = useWalletConnection();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<Array<{ trait_type: string; value: string }>>([
    { trait_type: '', value: '' },
  ]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      collectionId: '',
      royaltyPercentage: 5,
      attributes: [{ trait_type: '', value: '' }],
    },
  });

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Add a new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  // Remove an attribute field
  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  // Update an attribute field
  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  // Submit the form
  const onSubmit = async (data: FormValues) => {
    if (!connected) {
      await connect();
      return;
    }

    if (!file) {
      setError('Please upload an image for your NFT');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Filter out empty attributes
      const filteredAttributes = attributes.filter(
        (attr) => attr.trait_type.trim() !== '' && attr.value.trim() !== ''
      );

      const nftParams: CreateNFTParams = {
        name: data.name,
        description: data.description,
        image: file,
        collectionId: data.collectionId || undefined,
        royalty: data.royaltyPercentage, // Changed to match the interface
        attributes: filteredAttributes,
      };

      // Create the NFT
      const nft = await nftService.createNFT(wallet, nftParams);
      
      // Navigate to the NFT detail page
      navigate(`/nft/${nft.address.toString()}`);
    } catch (error) {
      console.error('Error creating NFT:', error);
      setError(error instanceof Error ? error.message : 'Failed to create NFT');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Create New NFT</h1>

      {!connected && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary-700 mb-2">Connect Your Wallet</h2>
          <p className="text-primary-600 mb-4">
            You need to connect your wallet to create an NFT.
          </p>
          <button
            onClick={connect}
            className="btn btn-primary"
          >
            Connect Wallet
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column - Image upload */}
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-80 cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-dark-300 hover:border-primary-400 hover:bg-dark-50'
              }`}
            >
              <input {...getInputProps()} />
              
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="NFT preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-dark-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-dark-900"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 text-dark-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-dark-500 text-center">
                    {isDragActive
                      ? 'Drop the image here'
                      : 'Drag & drop an image, or click to select'}
                  </p>
                  <p className="text-dark-400 text-sm mt-2 text-center">
                    Supports JPG, PNG, GIF, WEBP (max 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right column - Form fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark-700 mb-1">
                Name *
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="name"
                    className="input"
                    placeholder="Enter NFT name"
                  />
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dark-700 mb-1">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="description"
                    rows={4}
                    className="input"
                    placeholder="Describe your NFT"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-dark-700 mb-1">
                Collection (Optional)
              </label>
              <Controller
                name="collectionId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id="collection"
                    className="input"
                  >
                    <option value="">Select a collection</option>
                    {MOCK_COLLECTIONS.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div>
              <label htmlFor="royalty" className="block text-sm font-medium text-dark-700 mb-1">
                Royalty Percentage
              </label>
              <Controller
                name="royaltyPercentage"
                control={control}
                rules={{
                  min: { value: 0, message: 'Minimum royalty is 0%' },
                  max: { value: 15, message: 'Maximum royalty is 15%' },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    id="royalty"
                    className="input"
                    min="0"
                    max="15"
                    step="0.1"
                  />
                )}
              />
              {errors.royaltyPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.royaltyPercentage.message}</p>
              )}
              <p className="mt-1 text-sm text-dark-500">
                Percentage of secondary sales you'll receive (0-15%)
              </p>
            </div>
          </div>
        </div>

        {/* Attributes section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Attributes (Optional)</h2>
            <button
              type="button"
              onClick={addAttribute}
              className="btn btn-outline text-sm py-1"
            >
              Add Attribute
            </button>
          </div>

          <div className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    placeholder="Trait Type (e.g. Color)"
                    className="input"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    placeholder="Value (e.g. Blue)"
                    className="input"
                  />
                </div>
                {attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="p-2 text-dark-500 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary py-3 px-8"
            disabled={isSubmitting || !connected}
          >
            {isSubmitting ? 'Creating...' : 'Create NFT'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNFTPage;
