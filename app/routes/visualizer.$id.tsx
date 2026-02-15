import type { Route } from "./+types/visualizer.$id";
import { createProject, getProjectById, updateProject } from "lib/puter.action";
import { useParams, useLocation, useNavigate } from "react-router";
import Button from "components/ui/Button";
import { generate3Dview } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ComparisonSlider from "components/ComparisonSlider";
import "../comparison-slider.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomi | AI Visualizer" },
    { name: "description", content: "View and compare your AI-generated 3D architectural renders." },
    { property: "og:title", content: "Roomi | AI Visualizer" },
    { property: "og:type", content: "article" },
  ];
}

const VisualizerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [project, setProject] = useState<DesignItem | null>(() => {
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

  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(state.initialRender || null);

  const hasInitialGenerated = useRef(false);

  const handleBack = () => navigate('/');

  const runGeneration = async (projectItem: DesignItem) => {
    if (!projectItem.sourceImage || isProcessing) return;

    try {
      setIsProcessing(true);
      const result = await generate3Dview({ sourceImage: projectItem.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        // Persist the rendered image back to the project
        const updatedProject = {
          ...projectItem,
          renderedImage: result.renderedImage
        };

        const saved = await createProject({
          item: updatedProject as DesignItem,
          visibility: 'private'
        });
        
        if (saved) {
            setProject(saved);
        }
      }
    } catch (error) {
      console.error('Failed to generate 3D view', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    if (!state.initialImage) {
        loadProject();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  const [shareStatus, setShareStatus] = useState<'idle' | 'saving'>('idle');

  const handleShare = async () => {
    if (!project || !id) return;
    
    try {
      setShareStatus('saving');
      const newIsPublic = !project.isPublic;
      const updated = await updateProject(id, { isPublic: newIsPublic });
      
      if (updated) {
        setProject(updated);
        if (newIsPublic) {
          await navigator.clipboard.writeText(window.location.href);
          alert('Project is now public! Link copied to clipboard.');
        } else {
          alert('Project is now private.');
        }
      }
    } catch (error) {
      console.error('Failed to share project:', error);
    } finally {
      setShareStatus('idle');
    }
  };

  const handleExport = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `${project?.name || 'roomify-render'}.png`;
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
              <h2>{project?.name || state.name || 'Untitled Project'}</h2>
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
              <Button 
                size='sm' 
                onClick={handleShare} 
                className={`share ${project?.isPublic ? 'bg-green-600 hover:bg-green-700' : ''}`}
                disabled={shareStatus === 'saving' || !project}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {shareStatus === 'saving' ? 'Saving...' : project?.isPublic ? 'Shared' : 'Share'}
              </Button>
            </div>
          </div>
          
          <div className={`render-area ${isProcessing ? `is-processing` : ''}`}>
            {currentImage && project?.sourceImage && !isProcessing ? (
              <ComparisonSlider 
                beforeImage={project.sourceImage} 
                afterImage={currentImage} 
                className="render-img"
              />
            ) : currentImage ? (
              <img src={currentImage} alt="Ai render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {project?.sourceImage ? (
                  <img src={project.sourceImage} alt="Original"
                    className="render-fallback" />
                ) : (
                  <div className="loading-state">
                    <RefreshCcw className="icon animate-spin text-zinc-300" />
                    <p className="text-zinc-400 text-xs mt-2">
                        {isProjectLoading ? "Fetching project..." : "Loading floor plan..."}
                    </p>
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