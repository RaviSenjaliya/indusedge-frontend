
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Category, Product } from '../types';
import { Layers, ArrowRight, Box, Activity, Cpu, Settings, Zap, Wrench } from 'lucide-react';

const IconMap: Record<string, any> = {
  Zap, Settings, Cpu, Activity, Wrench
};

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allCats, allProds] = await Promise.all([
          db.getCategories(),
          db.getProducts()
        ]);

        const enriched = allCats
          .filter(c => c.isActive)
          .map(cat => ({
            ...cat,
            count: allProds.filter(p => p.categoryId === cat.id && p.isActive).length
          }));
        
        setCategories(enriched);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 transition-colors">
        <div className="text-center space-y-6">
           <div className="w-16 h-16 border-4 border-slate-900 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
           <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Mapping Industrial Verticals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24 animate-in fade-in duration-700 transition-colors duration-300">
      {/* Hero Branding */}
      <div className="bg-slate-900 py-16 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-4 rotate-12 -translate-y-24">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="h-32 border border-white/20 rounded-2xl"></div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-xl shadow-blue-500/20">
            <Layers className="h-3 w-3" />
            <span>Operational Taxonomy</span>
          </div>
          <h1 className="text-4xl md:text-4xl font-black text-white uppercase tracking-tighter mb-6">Technical Segments</h1>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Our catalog is organized into specialized industrial classifications to streamline your technical procurement process.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const IconComponent = IconMap[cat.icon] || Activity;
            return (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col"
              >
                <div className="h-64 relative overflow-hidden shrink-0">
                  <img 
                    src={cat.image} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    alt={cat.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                    <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                      {cat.count} Units
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium flex-grow">{cat.description}</p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Explore Segment</span>
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group border border-slate-800 transition-colors shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <Box className="h-12 w-12 text-blue-500 mb-6 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Custom Sourcing</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Need a classification not listed here? Our global network allows us to source components across all technical domains.
            </p>
            <Link 
              to="/inquiry" 
              className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
            >
              Contact Engineering
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
