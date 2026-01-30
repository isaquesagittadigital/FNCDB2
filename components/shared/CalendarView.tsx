
import React from 'react';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView: React.FC = () => {
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
  // Static mockup for January 2026 based on the screenshot
  // Starts on Thursday (Qui), ends on Saturday (Sab)
  // Filling in some previous and next month days to complete the grid
  const calendarDays = [
    { day: 28, currentMonth: false }, { day: 29, currentMonth: false }, { day: 30, currentMonth: false }, { day: 31, currentMonth: false },
    { day: 1, currentMonth: true }, { day: 2, currentMonth: true }, { day: 3, currentMonth: true },
    { day: 4, currentMonth: true }, { day: 5, currentMonth: true }, { day: 6, currentMonth: true }, { day: 7, currentMonth: true },
    { day: 8, currentMonth: true }, { day: 9, currentMonth: true }, { day: 10, currentMonth: true },
    { day: 11, currentMonth: true }, { day: 12, currentMonth: true }, { day: 13, currentMonth: true }, { day: 14, currentMonth: true },
    { day: 15, currentMonth: true }, { day: 16, currentMonth: true }, { day: 17, currentMonth: true },
    { day: 18, currentMonth: true }, { day: 19, currentMonth: true }, { day: 20, currentMonth: true }, { day: 21, currentMonth: true },
    { day: 22, currentMonth: true }, { day: 23, currentMonth: true }, { day: 24, currentMonth: true },
    { day: 25, currentMonth: true }, { day: 26, currentMonth: true }, { day: 27, currentMonth: true }, { day: 28, currentMonth: true },
    { day: 29, currentMonth: true, highlighted: true }, { day: 30, currentMonth: true }, { day: 31, currentMonth: true },
    { day: 1, currentMonth: false }, { day: 2, currentMonth: false }, { day: 3, currentMonth: false }, { day: 4, currentMonth: false },
    { day: 5, currentMonth: false }, { day: 6, currentMonth: false }, { day: 7, currentMonth: false }
  ];

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <span className="text-[#00A3B1] font-bold">Calendário</span>
      </div>

      {/* Header Controls */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#002B49]">Calendário</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-[#64748B] text-white text-xs font-bold rounded hover:bg-slate-600 transition-colors shadow-sm">
              Hoje
            </button>
            <div className="flex border border-slate-200 rounded overflow-hidden shadow-sm">
              <button className="px-3 py-1.5 bg-[#1E293B] text-white hover:bg-slate-700 transition-colors border-r border-slate-600">
                <ChevronLeft size={16} />
              </button>
              <button className="px-3 py-1.5 bg-[#1E293B] text-white hover:bg-slate-700 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="text-lg text-[#002B49] font-medium">
            janeiro de 2026
          </div>
          
          <div className="w-40"></div> {/* Spacer to maintain layout balance */}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-bold text-[#64748B] border-r last:border-r-0 border-slate-200">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => (
            <div 
              key={idx} 
              className={`min-h-[120px] p-2 border-b border-r last:border-r-0 border-slate-100 group transition-colors hover:bg-slate-50 cursor-pointer ${
                cell.highlighted ? 'bg-[#FEFCE8]' : 'bg-white'
              }`}
            >
              <div className={`text-right text-[11px] font-bold ${cell.currentMonth ? 'text-[#002B49]' : 'text-slate-300'}`}>
                {cell.day}
              </div>
              {/* Event placeholders could go here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
