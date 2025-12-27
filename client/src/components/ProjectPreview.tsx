import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Project } from '../types';
import { iframeScript } from '../assets/assets';
import EditorPanel from '../components/EditorPanel'
export interface ProjectPreviewRef {
    getCode : () => string | undefined;
}

export interface ProjectPreviewProps {
    project : Project;
    isGenerating : boolean;
    device ?: 'phone' | 'tablet' | 'desktop';
    showEditorPanel ?: boolean;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({project, isGenerating, device = 'desktop', showEditorPanel = true}, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [selectedElement, setSelectedElement] = useState<any>(null);

    const handleUpdate = (updates : any) => {
        if(iframeRef.current?.contentWindow){
            iframeRef.current.contentWindow.postMessage({
                type : "UPDATE_ELEMENT",
                payload : updates
            }, '*')
        }
    }

    const resolutions = {
        phone : 'w-[412px]',
        tablet : 'w-[768px]',
        desktop : 'w-full'
    }

    useImperativeHandle(ref, () => {
        getCode : () => {
            const doc = iframeRef.current?.contentDocument;
            if(!doc) return undefined;

            // 1 remove our selection class / attributes / outline from all elements
            doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el) => {
                el.classList.remove('ai-selected-element');
                el.removeAttribute('data-ai-selected');
                (el as HTMLElement).style.outline = '';
            })

            // 2 remove injected style + script from the doc
            const previewStyle = doc.getElementById('ai-preview-style');
            if(previewStyle) previewStyle.remove();

            const previewScript = doc.getElementById('ai-preview-script');
            if(previewScript) previewScript.remove();

            const html = doc.documentElement.outerHTML;
            return html;
        }
    })

    const injectPreview = (html:string) => {
        if(!html) return '';
        if(!showEditorPanel) return html;

        if(html.includes('</body>')){
            return html.replace('</body>', iframeScript + '</body>')
        } else {
            return html + iframeScript + '</body>';
        }
    }

    useEffect(() => {
        const handleMessage = (event : MessageEvent) => {
            if(event.data.type === 'ELEMENT_SELECTED'){
                setSelectedElement(event.data.payload);
            } else if(event.data.type === 'CLEAR_SELECTION'){
                setSelectedElement(null);
            }
        }

        window.addEventListener('message', handleMessage);

        return () => window.removeEventListener('message', handleMessage);
    }, [])
  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
      {
        project.current_code ? (
            <>
                <iframe ref={iframeRef} srcDoc={injectPreview(project.current_code)} className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}></iframe>
                {
                    showEditorPanel && selectedElement && (
                        <EditorPanel selectedElement={selectedElement} onUpdate={handleUpdate} onClose={() => {
                            setSelectedElement(null);
                            if(iframeRef.current?.contentWindow){
                                iframeRef.current.contentWindow.postMessage({type : 'CLEAR_SELECTION_REQUEST'}, '*')
                            }
                        }}/>
                    )
                }
            </>
        ) : isGenerating && (
            <div>
                Loading
            </div>
        )
      }
    </div>
  )
})

export default ProjectPreview
