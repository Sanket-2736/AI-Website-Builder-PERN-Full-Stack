import React, { useEffect, useState } from 'react'
import type { Project } from '../types'
import { Loader2Icon, PlusIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import api from '../configs/axios'
import { toast } from 'sonner'

const Community = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])

  const fetchProjects = async () => {
    try {
      const {data} = await api.get(`/api/project/published`);
      setProjects(data.projects);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Internal server error!")
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const navigate = useNavigate()

  return (
    <>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="size-7 animate-spin text-indigo-200" />
          </div>
        ) : projects.length > 0 ? (
          <div className="py-10 min-h-[80vh]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-medium text-white">Published Projects</h1>
            </div>

            <div className="flex flex-wrap gap-3.5">
              {projects.map((item) => (
                <Link
                  key={item.id}
                  to={`/view/${item.id}`}
                  target="_blank"
                  className="group max-sm:mx-auto w-72 cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden hover:border-indigo-800/80 transition-all duration-300"
                >
                  {/* Preview */}
                  <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                    {item.current_code ? (
                      <iframe
                        srcDoc={item.current_code}
                        frameBorder={0}
                        sandbox="allow-scripts allow-same-origin"
                        className="absolute top-0 left-0 w-[1280px] h-[800px] origin-top-left pointer-events-none"
                        style={{ transform: 'scale(0.25)' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        No preview available
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 text-white bg-linear-180 from-transparent group-hover:from-indigo-950 to-transparent transition-colors">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium line-clamp-2">
                        {item.name}
                      </h2>
                      <span className="px-2.5 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded-full">
                        Website
                      </span>
                    </div>

                    <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                      {item.initial_prompt}
                    </p>

                    <div className="flex justify-between items-center mt-6">
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(`/preview/${item.id}`)
                        }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-colors flex items-center gap-2 text-sm"
                      >
                        <span className="bg-gray-200 size-4.5 rounded-full text-black font-semibold flex items-center justify-center">
                          {item.user?.name?.charAt(0) ?? '?'}
                        </span>
                        {item.user?.name ?? 'Anonymous'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-3xl font-semibold py-20 text-gray-300">
              You have no projects yet!
            </h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white px-6 py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all"
            >
              <PlusIcon size={18} /> New
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export default Community
