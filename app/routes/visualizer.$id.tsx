import { createProject, getProjectById } from "lib/puter.action";
import { useParams, useLocation, useNavigate } from "react-router";
import Button from "components/ui/Button";
import { generate3Dview } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ComparisonSlider from "components/ComparisonSlider";
import "../comparison-slider.css";

const VisualizerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    // Initialize state with location.state values to prevent empty flashes 
    const [projectData, setProjectData] = useState<DesignItem | null>(() => {
        if (state.initialImage) {
            return {
                id: id || 'temp',
                name: state.name || 'Untitled Project',
                sourceImage: state.initialImage,
                renderedImage: state.initialRender,
                timestamp: Date.now()
            };
        }
        return null;
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(state.initialRender || null);

    const hasInitialGenerated = useRef(false);

    const handleBack = () => navigate('/');

    const fetchProject = async () => {
        if (!id) return;
        try {
            const data = await getProjectById({ id });
            if (data) {
                setProjectData(data);
                if (data.renderedImage) {
                    setCurrentImage(data.renderedImage);
                }
            }
        } catch (error) {
            console.error('Failed to fetch project:', error);
        }
    };

    const runGeneration = async (sourceImage: string) => {
        if (!sourceImage || isProcessing) return;

        try {
            setIsProcessing(true);
            const result = await generate3Dview({ sourceImage });

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);

                // Persist the rendered image back to the project
                const updatedProject = {
                    ...(projectData || { id: id || '', name: state.name || 'Untitled Project', sourceImage, timestamp: Date.now() }),
                    renderedImage: result.renderedImage
                };

                await createProject({
                    item: updatedProject as DesignItem,
                    visibility: 'private'
                });
            }
        } catch (error) {
            console.error('Failed to generate 3D view', error);
        } finally {
            setIsProcessing(false);
        }
    }

    // Effect for fetching project data on load (if not in state)
    useEffect(() => {
        if (!state.initialImage) {
            fetchProject();
        }
    }, [id]);

    // Effect for triggering generation once project data is ready
    useEffect(() => {
        if (!projectData?.sourceImage || hasInitialGenerated.current) return;

        // If we already have a render, don't re-generate
        if (projectData.renderedImage) {
            setCurrentImage(projectData.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        // If no render, start generation
        if (!currentImage && !isProcessing) {
            hasInitialGenerated.current = true;
            runGeneration(projectData.sourceImage);
        }
    }, [projectData]);

    const handleExport = () => {
        if (!currentImage) return;
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `${projectData?.name || 'roomify-render'}.png`;
        link.click();
    };

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className='logo' />
                    <span className="name">Roomi</span>
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
                            <h2>{projectData?.name || state.name || 'Untitled Project'}</h2>
                            <p className="note">Created by You</p>
                        </div>
                        <div className="panel-actions">
                            <Button
                                size='sm'
                                onClick={handleExport}
                                className="export"
                                disabled={!currentImage || isProcessing}>
                                <Download className="icon" />
                                Export
                            </Button>
                            <Button size='sm' onClick={() => {}} className="share">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                    
                    <div className={`render-area ${isProcessing ? `is-processing` : ''}`}>
                        {currentImage && projectData?.sourceImage && !isProcessing ? (
                            <ComparisonSlider 
                                beforeImage={projectData.sourceImage} 
                                afterImage={currentImage} 
                                className="render-img"
                            />
                        ) : currentImage ? (
                            <img src={currentImage} alt="Ai render" className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {projectData?.sourceImage ? (
                                    <img src={projectData.sourceImage} alt="Original"
                                        className="render-fallback" />
                                ) : (
                                    <div className="loading-state">
                                        <RefreshCcw className="icon animate-spin text-zinc-300" />
                                        <p className="text-zinc-400 text-xs mt-2">Loading floor plan...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="icon animate-spin" />
                                    <span className="title">Rendering...</span>
                                    <span className="subtitle">Converting floor plan to 3D</span>
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