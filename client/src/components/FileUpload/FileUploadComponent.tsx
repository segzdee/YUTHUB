import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  File,
  Image,
  Download,
  Share2,
  Eye,
  Trash2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FileUploadProps {
  entityType: string;
  entityId: number;
  documentType?: string;
  onUploadComplete?: (files: any[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
}

interface Document {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  entityType: string;
  entityId: number;
  documentType: string;
  description?: string;
  tags?: string[];
  isConfidential: boolean;
  version: number;
  downloadCount: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  documentType = 'document',
  onUploadComplete,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
}) => {
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState(documentType);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUserId, setShareUserId] = useState('');
  const [shareAccessLevel, setShareAccessLevel] = useState('view');
  const [shareReason, setShareReason] = useState('');

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: [
      '/api/files/documents',
      entityType,
      entityId,
      filterType,
      searchQuery,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        entityType,
        entityId: entityId.toString(),
        ...(filterType !== 'all' && { documentType: filterType }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await apiRequest(`/api/files/documents?${params}`);
      return response as Document[];
    },
  });

  // Storage analytics
  const { data: storageAnalytics } = useQuery({
    queryKey: ['/api/files/analytics'],
    queryFn: async () => {
      const response = await apiRequest('/api/files/analytics');
      return response as {
        totalFiles: number;
        totalSize: number;
        limit: number;
        usagePercentage: number;
      };
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: data => {
      toast({
        title: 'Upload successful',
        description: `${data.files.length} file(s) uploaded successfully`,
      });

      setUploadingFiles([]);
      setUploadProgress({});
      setDescription('');
      setTags('');
      setIsConfidential(false);

      queryClient.invalidateQueries({ queryKey: ['/api/files/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/analytics'] });

      onUploadComplete?.(data.files);
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploadingFiles([]);
      setUploadProgress({});
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest(`/api/files/documents/${documentId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Document deleted',
        description: 'Document has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/files/analytics'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (shareData: {
      documentId: number;
      sharedWith: string;
      accessLevel: string;
      shareReason: string;
    }) => {
      await apiRequest('/api/files/share', {
        method: 'POST',
        body: JSON.stringify(shareData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Document shared',
        description: 'Document has been successfully shared',
      });
      setShowShareDialog(false);
      setShareUserId('');
      setShareAccessLevel('view');
      setShareReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Share failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter(file => {
        if (file.size > maxSize) {
          toast({
            title: 'File too large',
            description: `${file.name} is larger than ${maxSize / 1024 / 1024}MB`,
            variant: 'destructive',
          });
          return false;
        }

        if (!acceptedTypes.includes(file.type)) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not a supported file type`,
            variant: 'destructive',
          });
          return false;
        }

        return true;
      });

      if (validFiles.length + uploadingFiles.length > maxFiles) {
        toast({
          title: 'Too many files',
          description: `Maximum ${maxFiles} files allowed`,
          variant: 'destructive',
        });
        return;
      }

      setUploadingFiles(prev => [...prev, ...validFiles]);
    },
    [maxFiles, maxSize, acceptedTypes, uploadingFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    multiple: true,
  });

  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;

    const formData = new FormData();

    uploadingFiles.forEach(file => {
      formData.append('files', file);
    });

    formData.append('entityType', entityType);
    formData.append('entityId', entityId.toString());
    formData.append('documentType', selectedDocumentType);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('isConfidential', isConfidential.toString());

    uploadMutation.mutate(formData);
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/files/download/${document.id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = document.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    if (!selectedDocument || !shareUserId || !shareReason) return;

    shareMutation.mutate({
      documentId: selectedDocument.id,
      sharedWith: shareUserId,
      accessLevel: shareAccessLevel,
      shareReason,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className='w-4 h-4' />;
    return <File className='w-4 h-4' />;
  };

  const documentTypes = [
    { value: 'document', label: 'Document' },
    { value: 'photo', label: 'Photo' },
    { value: 'contract', label: 'Contract' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'form', label: 'Form' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'report', label: 'Report' },
  ];

  return (
    <div className='space-y-6'>
      {/* Storage Analytics */}
      {storageAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='w-5 h-5' />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>{storageAnalytics.totalFiles} files</span>
                <span>
                  {formatFileSize(storageAnalytics.totalSize)} /{' '}
                  {formatFileSize(storageAnalytics.limit)}
                </span>
              </div>
              <Progress
                value={storageAnalytics.usagePercentage}
                className='h-2'
              />
              {storageAnalytics.usagePercentage > 80 && (
                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    Storage usage is high. Consider upgrading your plan or
                    cleaning up old files.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='upload' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='upload'>Upload Files</TabsTrigger>
          <TabsTrigger value='manage'>Manage Files</TabsTrigger>
        </TabsList>

        <TabsContent value='upload' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Upload documents, photos, and other files for {entityType} #
                {entityId}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* File Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                <p className='text-lg font-medium'>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className='text-sm text-gray-500 mt-2'>
                  Or click to browse files (max {maxFiles} files,{' '}
                  {formatFileSize(maxSize)} each)
                </p>
              </div>

              {/* Upload Configuration */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='documentType'>Document Type</Label>
                  <Select
                    value={selectedDocumentType}
                    onValueChange={setSelectedDocumentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select document type' />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='tags'>Tags (comma-separated)</Label>
                  <Input
                    id='tags'
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder='urgent, review, confidential'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder='Enter file description...'
                  rows={3}
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='confidential'
                  checked={isConfidential}
                  onChange={e => setIsConfidential(e.target.checked)}
                  className='rounded border-gray-300'
                />
                <Label htmlFor='confidential'>Mark as confidential</Label>
              </div>

              {/* Uploading Files Preview */}
              {uploadingFiles.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium'>Files to Upload:</h4>
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded'
                    >
                      <div className='flex items-center gap-2'>
                        {getFileIcon(file.type)}
                        <span className='text-sm'>{file.name}</span>
                        <span className='text-xs text-gray-500'>
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setUploadingFiles(prev =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={
                  uploadingFiles.length === 0 || uploadMutation.isPending
                }
                className='w-full'
              >
                {uploadMutation.isPending
                  ? 'Uploading...'
                  : `Upload ${uploadingFiles.length} file(s)`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='manage' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>File Management</CardTitle>
              <CardDescription>
                Search, filter, and manage uploaded files
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Search and Filter */}
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <Input
                    placeholder='Search files...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Filter by type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Files List */}
              <div className='space-y-2'>
                {documentsLoading ? (
                  <div className='text-center py-8'>Loading files...</div>
                ) : documents?.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    No files found
                  </div>
                ) : (
                  documents?.map(document => (
                    <div
                      key={document.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center gap-3'>
                        {getFileIcon(document.mimeType)}
                        <div>
                          <div className='font-medium'>
                            {document.originalName}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {formatFileSize(document.fileSize)} •{' '}
                            {document.documentType}
                            {document.isConfidential && (
                              <Badge variant='secondary' className='ml-2'>
                                Confidential
                              </Badge>
                            )}
                          </div>
                          {document.description && (
                            <div className='text-xs text-gray-400 mt-1'>
                              {document.description}
                            </div>
                          )}
                          {document.tags && document.tags.length > 0 && (
                            <div className='flex gap-1 mt-1'>
                              {document.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDownload(document)}
                        >
                          <Download className='w-4 h-4' />
                        </Button>

                        <Dialog
                          open={showShareDialog}
                          onOpenChange={setShowShareDialog}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => setSelectedDocument(document)}
                            >
                              <Share2 className='w-4 h-4' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Share Document</DialogTitle>
                              <DialogDescription>
                                Share "{selectedDocument?.originalName}" with
                                another user
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                              <div>
                                <Label htmlFor='shareUserId'>User ID</Label>
                                <Input
                                  id='shareUserId'
                                  value={shareUserId}
                                  onChange={e => setShareUserId(e.target.value)}
                                  placeholder='Enter user ID to share with'
                                />
                              </div>

                              <div>
                                <Label htmlFor='shareAccessLevel'>
                                  Access Level
                                </Label>
                                <Select
                                  value={shareAccessLevel}
                                  onValueChange={setShareAccessLevel}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='view'>
                                      View Only
                                    </SelectItem>
                                    <SelectItem value='download'>
                                      Download
                                    </SelectItem>
                                    <SelectItem value='edit'>Edit</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor='shareReason'>
                                  Reason for Sharing
                                </Label>
                                <Textarea
                                  id='shareReason'
                                  value={shareReason}
                                  onChange={e => setShareReason(e.target.value)}
                                  placeholder='Why are you sharing this document?'
                                  rows={3}
                                />
                              </div>

                              <Button
                                onClick={handleShare}
                                disabled={
                                  !shareUserId ||
                                  !shareReason ||
                                  shareMutation.isPending
                                }
                                className='w-full'
                              >
                                {shareMutation.isPending
                                  ? 'Sharing...'
                                  : 'Share Document'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteMutation.mutate(document.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileUploadComponent;
