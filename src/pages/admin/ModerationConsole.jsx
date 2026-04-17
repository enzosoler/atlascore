import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Check,
  Eye,
  X,
  Flag,
  AlertCircle,
  UserX,
  Ban,
} from 'lucide-react';

const CATEGORY_COLORS = {
  profile: 'bg-blue-100 text-blue-700 border-blue-200',
  social: 'bg-green-100 text-green-700 border-green-200',
  progress: 'bg-amber-100 text-amber-700 border-amber-200',
  health: 'bg-red-100 text-red-700 border-red-200',
};

const REASONS_FOR_VIEW = [
  { value: 'report_investigation', label: 'Report Investigation' },
  { value: 'safety_concern', label: 'User Safety Concern' },
  { value: 'legal_compliance', label: 'Legal Compliance' },
  { value: 'platform_integrity', label: 'Platform Integrity Check' },
  { value: 'support_request', label: 'Support Request Resolution' },
];

export default function ModerationConsole() {
  const { hasPermission, setIsModerationMode } = useOutletContext();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewReason, setViewReason] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  useEffect(() => {
    setIsModerationMode(true);
    fetchQueue();
    return () => setIsModerationMode(false);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('moderation', {
        body: { action: 'get_queue' },
      });

      if (error) throw error;
      setQueue(data?.queue || []);
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPhoto = async (photo) => {
    if (!viewReason) {
      alert('Please select a reason for viewing this content');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('moderation', {
        body: { 
          action: 'get_photo',
          photo_id: photo.photo_id,
          reason: viewReason 
        },
      });

      if (error) throw error;
      
      setSelectedPhoto(data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching photo:', error);
    }
  };

  const handleAction = async (action) => {
    if (!actionReason) {
      alert('Please provide a reason for this action');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('moderation', {
        body: {
          action: 'take_action',
          photo_id: selectedPhoto.photo.id,
          action_type: action,
          reason: actionReason,
          case_id: selectedPhoto.photo.case_id,
          internal_notes: internalNotes,
        },
      });

      if (error) throw error;

      setIsDetailOpen(false);
      setSelectedPhoto(null);
      setActionReason('');
      setInternalNotes('');
      fetchQueue();
    } catch (error) {
      console.error('Error taking action:', error);
    }
  };

  const getCategoryBadge = (category) => {
    const colorClass = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700';
    return (
      <Badge variant="outline" className={colorClass}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Warning Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Moderation Mode — All actions are logged</span>
        </div>
        <span className="text-xs opacity-75">
          Session expires after 2 hours of inactivity
        </span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Moderation Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review reported and flagged content
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Check className="h-12 w-12 mb-4 opacity-50" />
            <p>No items in moderation queue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item) => (
              <Card key={item.photo_id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Thumbnail */}
                    <div 
                      className="w-32 h-32 bg-muted flex items-center justify-center border-r cursor-pointer"
                      onClick={() => {
                        setSelectedPhoto({ photo: item });
                        setIsDetailOpen(true);
                      }}
                    >
                      {item.category === 'progress' || item.category === 'health' ? (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <Eye className="h-6 w-6 mb-1" />
                          <span className="text-xs">Click to view</span>
                        </div>
                      ) : (
                        <img 
                          src={`/api/photos/${item.photo_id}/thumbnail`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryBadge(item.category)}
                            {item.report_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                <Flag className="h-3 w-3 mr-1" />
                                {item.report_count} reports
                              </Badge>
                            )}
                            {item.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">
                                High Priority
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            Uploaded {new Date(item.uploaded_at).toLocaleString()}
                          </p>
                          
                          {item.case_id && (
                            <p className="text-sm mt-1">
                              Case: <span className="font-mono">{item.case_number}</span>
                            </p>
                          )}

                          {item.report_reason && (
                            <p className="text-sm mt-1 text-amber-600">
                              Report reason: {item.report_reason}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            className="text-sm border rounded px-2 py-1"
                            value={viewReason}
                            onChange={(e) => setViewReason(e.target.value)}
                          >
                            <option value="">Reason for view...</option>
                            {REASONS_FOR_VIEW.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <Button 
                            size="sm" 
                            onClick={() => handleViewPhoto(item)}
                            disabled={!viewReason}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPhoto?.photo && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Photo Review
                  {getCategoryBadge(selectedPhoto.photo.category)}
                </DialogTitle>
                <DialogDescription>
                  Case: {selectedPhoto.photo.case_number || 'N/A'}
                </DialogDescription>
              </DialogHeader>

              {/* Sensitive Content Warning */}
              {(selectedPhoto.photo.category === 'progress' || selectedPhoto.photo.category === 'health') && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Sensitive Content — Private User Photo</p>
                      <p className="text-xs mt-1">
                        This content is private to the user. Access logged. 
                        View only when necessary for safety or legal compliance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {/* Photo */}
                <div className="col-span-2">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Photo preview would render here</p>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Action Reason</label>
                    <textarea
                      className="mt-1 w-full rounded-md border p-2 text-sm"
                      rows={3}
                      placeholder="Why are you taking this action?"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Internal Notes</label>
                    <textarea
                      className="mt-1 w-full rounded-md border p-2 text-sm"
                      rows={2}
                      placeholder="Optional internal note..."
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleAction('keep')}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Keep Content
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-amber-600"
                      onClick={() => handleAction('hide')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Hide from Public
                    </Button>

                    {hasPermission('remove_photos') && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600"
                        onClick={() => handleAction('remove')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Content
                      </Button>
                    )}

                    {hasPermission('suspend_users') && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-amber-600"
                        onClick={() => handleAction('suspend')}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend User (7 days)
                      </Button>
                    )}

                    {hasPermission('ban_users') && (
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={() => handleAction('ban')}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => handleAction('escalate')}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Escalate Case
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
