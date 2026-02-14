import { CheckCircle, ImageIcon, UploadIcon } from 'lucide-react'
import React, { useState, useCallback } from 'react'
import { useOutletContext } from 'react-router'
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from 'lib/constants'

interface UploadProps {
    onComplete?: (base64: string, file: File) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress, setProgress] = useState(0)

    const { isSignedIn } = useOutletContext<AuthContext>()

    const processFile = useCallback((selectedFile: File) => {
        if (!isSignedIn) return;

        setFile(selectedFile);
        setProgress(0);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            onComplete?.(base64, selectedFile);
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return prev + PROGRESS_STEP;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(selectedFile);
    }, [isSignedIn, onComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isSignedIn) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            processFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    return (
        <div className='upload'>
            {!file ? (
                <div 
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input 
                        type='file' 
                        className='drop-input' 
                        accept='.jpg,.jpeg,.png' 
                        disabled={!isSignedIn}
                        onChange={handleFileChange}
                    />
                    <div className='drop-content'>
                        <div className='drop-icon'>
                            <UploadIcon size={20} />
                        </div>
                        <p>{isSignedIn ? (
                            "Click to upload or just drag and drop"
                        ) : ("sign in or sign up with puter to upload")}</p>
                        <p className='help'>Supports PNG, JPG, or PDF (Max 10MB)</p>
                    </div>
                </div>
            ) : (
                <div className='upload-status'>
                    <div className='status-content'>
                        <div className='status-icon'>
                            {progress === 100 ? (
                                <CheckCircle className='check' size={20} />
                            ) : (
                                <ImageIcon className='image' size={20} />
                            )}
                        </div>

                        <h3>{file.name}</h3>
                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <div className='progress'>
                            <div className='bar' style={{ width: `${progress}%` }} />
                            <p className='status-text'>{progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Upload
