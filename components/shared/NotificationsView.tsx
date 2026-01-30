
import React, { useState } from 'react';
import { Home, Trash2 } from 'lucide-react';
import NotificationDetailModal from './modals/NotificationDetailModal';

interface Notification {
  id: number;
  title: string;
  content: string;
  isNew: boolean;
  isRead: boolean;
}

const NotificationsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Título da notificação', content: 'Conteúdo da notificação', isNew: true, isRead: false },
    { id: 2, title: 'Título da notificação', content: 'Conteúdo da notificação', isNew: true, isRead: false },
    { id: 3, title: 'Título da notificação', content: 'Conteúdo da notificação', isNew: false, isRead: true },
  ]);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const clearNotifications = () => {
    if (confirm('Deseja limpar todas as notificações?')) {
      setNotifications([]);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, isNew: false } : n));
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Home size={14} className="text-[#00A3B1]" />
        <span className="opacity-50 font-bold">{'>'}</span>
        <span className="text-slate-400 font-bold">Notificações</span>
      </div>

      <div className="flex items-start justify-between">
        <h2 className="text-xl font-bold text-[#002B49]">Notificações</h2>

        <div className="flex items-center gap-6">
          <button
            onClick={clearNotifications}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Limpar notificações
          </button>

          <div className="flex items-center gap-4 text-xs font-bold border-b border-slate-100 pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 pb-2 transition-all relative ${filter === 'all' ? 'text-[#00A3B1]' : 'text-slate-400'}`}
            >
              Todas
              {filter === 'all' && <div className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-[#00A3B1]" />}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 pb-2 transition-all relative ${filter === 'unread' ? 'text-[#00A3B1]' : 'text-slate-400'}`}
            >
              Não lidas
              {filter === 'unread' && <div className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-[#00A3B1]" />}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-2 pb-2 transition-all relative ${filter === 'read' ? 'text-[#00A3B1]' : 'text-slate-400'}`}
            >
              Lidas
              {filter === 'read' && <div className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-[#00A3B1]" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white border border-[#E6F6F7] rounded-2xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {notification.isNew && (
                    <span className="bg-[#E6F6F7] text-[#00A3B1] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Novo
                    </span>
                  )}
                  <h4 className="text-sm font-bold text-[#002B49]">{notification.title}</h4>
                </div>
                <p className="text-xs text-[#64748B] font-medium">{notification.content}</p>
              </div>

              <button
                onClick={() => {
                  setSelectedNotification(notification);
                  markAsRead(notification.id);
                }}
                className="text-xs font-bold text-[#00A3B1] hover:underline"
              >
                Ver notificação
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 italic">
            Nenhuma notificação encontrada.
          </div>
        )}
      </div>

      <NotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />
    </div>
  );
};

export default NotificationsView;
