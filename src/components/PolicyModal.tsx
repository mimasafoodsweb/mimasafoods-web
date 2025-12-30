import { X } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function PolicyModal({ isOpen, onClose, title, content }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl" style={{ minHeight: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-serif font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
              {content}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-mimasa-primary text-white rounded-md hover:bg-mimasa-warm transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
