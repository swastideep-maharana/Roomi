import Navbar from 'components/Navbar';
import  type {Route} from './+types/home'
import { ArrowRight, ArrowUpRight, Clock, Layers, X } from 'lucide-react';
import Button from 'components/ui/Button';
import Upload from 'components/Upload';
import { useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { createProject, deleteProject, getProjects } from 'lib/puter.action';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomi | AI-Powered 3D Room Visualizer" },
    { name: "description", content: "Transform your 2D floor plans into photorealistic 3D architectural renders in seconds using AI." },
  ];
}

export default function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<DesignItem[]>([]);

  const isCreatingProjectRef = useRef(false);

  useEffect(() => {
    const loadProjects = async () => {
      const data = await getProjects();
      const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
      setProjects(sorted);
    };
    loadProjects();
  }, []);


  const handleUploadComplete = async (base64Image:string) =>{
    try {
    if(isCreatingProjectRef.current){
      return false;
    }
    isCreatingProjectRef.current = true;
    const newId = Date.now().toString();
    const name = `residence ${newId}`;

    const newItem: DesignItem = { 
      id: newId, name, sourceImage: base64Image, 
      renderedImage: undefined,
      timestamp: Date.now(),
    }
    
    const saved = await createProject({item: newItem, visibility:'private'});

    if(!saved){
      alert('failed to save project');
      return false;
    }

    setProjects((prev)=>[newItem, ...prev ]);
    
    navigate(`/visualizer/${newId}`, {
      state:{
        initialImage:saved.sourceImage,
        initialRender:saved.renderedImage || null, name
      }
    });

    return true;
    } finally {
      isCreatingProjectRef.current = false;
    }

  } 

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    const success = await deleteProject(id);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Failed to delete project');
    }
  };

  return (
    <div className='home'>
      <Navbar />
      <section className='hero'>
        <div className='announce'>
          <div className='dot'>
            <div className='pulse'>

            </div>

          </div>
          <p>Introducing Roomi</p>
        </div>
        <h1>Build beautiful spaces at the speed of thought with Roomi</h1>
        <p className='subtitle'>Roomi is an AI-First design environment thta helps you visualize,render, and ship architectural projects faster than ever .</p>

        <div className='actions'>
          <a href="#upload" className='cta'>Start Building  <ArrowRight/></a>
          <Button className='demo' size='lg' variant='secondary'>Watch Demo</Button>
        </div>
        <div id='upload' className='upload-shell'>
          <div className='grid-overlay '/>
          <div className='upload-card'>
            <div className='upload-head'>
              <div className='upload-icon'>
                <Layers className='icon'/>
              </div>
              <div className='upload-info'>
                <h3>Upload Floor Plan</h3>
                <p>Supports PNG, JPG, or PDF (Max 10MB)</p>
              </div>

              <Upload onComplete={handleUploadComplete}/>
            </div>
          </div>
        </div>
      </section>

      <section className='projects'>
        <div className='section-inner'>
          <div className='section-head'>
            <div className='copy'>
              <h2>Projects</h2>
              <p>your latest work and shared community projects, all in one place.</p>
            </div>
          </div>
          <div className='projects-grid'>
            {projects.map(({id, name, renderedImage, sourceImage, timestamp, isPublic}) => (
              <div key={id} className='project-card group' onClick={() => navigate(`/visualizer/${id}`, { state: { name, initialImage: sourceImage, initialRender: renderedImage } })}>
                <div className='preview'>
                  <img src={renderedImage || sourceImage} alt={name || 'project'} />
                  {isPublic && (
                    <div className='badge'>
                      <span>Community</span>
                    </div>
                  )}
                  <button 
                    className="absolute top-2 right-2 p-2 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20"
                    onClick={(e) => handleDeleteProject(e, id)}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className='card-body'>
                  <div>
                    <h3>{name || 'Untitled Project'}</h3>
                    <div className='meta'>
                      <Clock size={12}/>
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>By Swastideep</span>
                    </div>
                  </div>
                  <div className='arrow'>
                    <ArrowUpRight size={18}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  </div>
  )
  
}
