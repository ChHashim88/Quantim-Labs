"use client";

import React, { useState, useMemo } from "react";
import { mentors } from "./data";
import { Search, MapPin, GraduationCap, Briefcase, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export function MentorsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedDegree, setSelectedDegree] = useState("All");

  const countries = ["All", "Pakistan", "USA", "UK", "Australia", "Saudia Arabia"];
  const degrees = ["All", "BS", "MPhil", "PhD"];

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = selectedCountry === "All" || mentor.location === selectedCountry;
      
      const matchesDegree = selectedDegree === "All" || mentor.degree.startsWith(selectedDegree);

      return matchesSearch && matchesCountry && matchesDegree;
    });
  }, [searchQuery, selectedCountry, selectedDegree]);

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get gradient color based on first letter
  const getGradient = (name: string) => {
    const gradients = [
      "from-blue-500 to-indigo-500",
      "from-emerald-400 to-cyan-500",
      "from-violet-500 to-fuchsia-500",
      "from-orange-400 to-rose-400",
      "from-cyan-500 to-blue-500"
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="w-full">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search by name, role, or expertise..." 
              className="pl-12 bg-slate-50 border-transparent focus:bg-white h-12 rounded-2xl text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <select 
                className="w-full h-12 pl-4 pr-10 bg-slate-50 border-transparent focus:bg-white rounded-2xl text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {countries.map(c => <option key={c} value={c}>{c === "All" ? "All Locations" : c}</option>)}
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative w-full md:w-48">
              <select 
                className="w-full h-12 pl-4 pr-10 bg-slate-50 border-transparent focus:bg-white rounded-2xl text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
              >
                {degrees.map(d => <option key={d} value={d}>{d === "All" ? "All Degrees" : d}</option>)}
              </select>
              <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-8 flex items-center justify-between">
        <p className="text-slate-500 font-medium">Showing <span className="text-slate-900">{filteredMentors.length}</span> world-class mentors</p>
      </div>

      {/* Grid */}
      {filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
              {/* Decorative Top Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(mentor.name)} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${getGradient(mentor.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 transform group-hover:scale-105 transition-transform`}>
                  {getInitials(mentor.name)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{mentor.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> {mentor.role}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-700">{mentor.degree}</span>
                    <br />
                    <span className="text-xs">{mentor.university}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{mentor.location}</span>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                {mentor.expertise.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="inline-flex w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No mentors found</h3>
          <p className="text-slate-500">Try adjusting your search or filters to find exactly what you're looking for.</p>
        </div>
      )}
    </div>
  );
}
