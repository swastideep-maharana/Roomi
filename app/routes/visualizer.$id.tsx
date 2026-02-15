import { createProject, getProjectById } from "lib/puter.action";
import { useParams, useLocation, useNavigate } from "react-router";
import Button from "components/ui/Button";
import { generate3Dview } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VisualizerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    const [projectData, setProjectData] = useState<DesignItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const hasInitialGenerated = useRef(false);

    const handleBack = () => navigate('/');

    const fetchProject = async () => {
        if (!id) return;
        const data = await getProjectById({ id });
        if (data) {
            setProjectData(data);
            if (data.renderedImage) {
                setCurrentImage(data.renderedImage);
            }
        }
    };

    const runGeneration = async (sourceImage: string) => {
        if (!sourceImage) return;

        try {
            setIsProcessing(true);
            const result = await generate3Dview({ sourceImage });

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);
                
                // Persist the rendered image back to the project
                if (projectData) {
                    await createProject({
                        item: {
                            ...projectData,
                            renderedImage: result.renderedImage
                        },
                        visibility: 'private'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to generate 3D view', error);
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        if (state.initialImage) {
            // Coming from upload flow
            setProjectData({
                id: id || '',
                name: state.name,
                sourceImage: state.initialImage,
                renderedImage: state.initialRender,
                timestamp: Date.now()
            });
            if (state.initialRender) {
                setCurrentImage(state.initialRender);
            }
        } else {
            // Direct access or refresh
            fetchProject();
        }
    }, [id]);

    useEffect(() => {
        if (!projectData?.sourceImage || hasInitialGenerated.current) return;

        if (projectData.renderedImage) {
            setCurrentImage(projectData.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        if (projectData.sourceImage && !currentImage && !isProcessing) {
            hasInitialGenerated.current = true;
            runGeneration(projectData.sourceImage);
        }
    }, [projectData]);

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className='logo' />
                    <span className="name">
                        Roomi
                    </span>
                </div>
                <Button variant='ghost' size='sm' onClick={handleBack} className='exit'>
                    <X className="icon" /> Exit Editor
                </Button>
            </nav>

            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{projectData?.name || 'Untitled Project'}</h2>
                            <p className="note">Created by You</p>
                        </div>
                        <div className="panel-actions">
                            <Button
                                size='sm'
                                onClick={() => { }}
                                className="export"
                                disabled={!currentImage || isProcessing}>
                                <Download className="icon" />
                                Export
                            </Button>
                            <Button size='sm' onClick={() => { }} className="share">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                    <div className={`render-area ${isProcessing ? `is-processing` : ''}`}>
                        {currentImage ? (
                            <img src={currentImage} alt="Ai render" className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {projectData?.sourceImage && (
                                    <img src={projectData.sourceImage} alt="Original"
                                        className="render-fallback" />
                                )}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="icon animate-spin" />
                                    <span className="title">Rendering...</span>
                                    <span className="subtitle">This may take a few seconds</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>

    );
};

export default VisualizerPage;