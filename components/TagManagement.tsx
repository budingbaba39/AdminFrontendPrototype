import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Trash2, Edit, Eye } from 'lucide-react';

const predefinedTags = [
  'LifetimeDeposit',
  'BONUSHUNTER',
  'FAKE RECEIPT',
  'VIP',
  'SPECIALPROMO',
  'tester',
  'Hunter',
  'VIPBRONZE'
];

// Generate initial tags from predefined list with default colors
const generateInitialTags = () => {
  return predefinedTags.map((tagName, index) => ({
    id: index + 1,
    name: tagName,
    description: '', // Empty description by default
    createdDate: '2023-08-15',
    badgeColor: '#e5e7eb', // Light gray background
    fontColor: '#374151', // Dark gray text
    isPredefined: true // Mark as predefined tag
  }));
};

export default function TagManagement() {
  const [searchFilter, setSearchFilter] = useState('');
  const [tags, setTags] = useState(generateInitialTags());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    badgeColor: '#e5e7eb', // Default light gray
    fontColor: '#374151'  // Default dark gray
  });

  // Filter tags based on search
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSearch = () => {
    // Search is already handled by filteredTags
  };

  const handleCreateTag = () => {
    const newTagData = {
      id: Math.max(...tags.map(t => t.id)) + 1,
      name: newTag.name,
      description: newTag.description,
      createdDate: new Date().toISOString().split('T')[0],
      badgeColor: newTag.badgeColor,
      fontColor: newTag.fontColor,
      isPredefined: false // Mark as custom tag
    };

    setTags(prev => [...prev, newTagData]);
    setShowCreateModal(false);
    setNewTag({
      name: '',
      description: '',
      badgeColor: '#e5e7eb',
      fontColor: '#374151'
    });
  };

  const handleEditTag = () => {
    if (!selectedTag) return;
    
    setTags(prev => prev.map(tag => 
      tag.id === selectedTag.id 
        ? {
            ...selectedTag,
            name: newTag.name,
            description: newTag.description,
            badgeColor: newTag.badgeColor,
            fontColor: newTag.fontColor
          }
        : tag
    ));
    
    setShowEditModal(false);
    setSelectedTag(null);
    setNewTag({
      name: '',
      description: '',
      badgeColor: '#e5e7eb',
      fontColor: '#374151'
    });
  };

  const handleDeleteTag = (id: number) => {
    const tagToDelete = tags.find(tag => tag.id === id);
    
    // Prevent deletion of predefined tags
    if (tagToDelete?.isPredefined) {
      alert('Cannot delete predefined tags. You can only edit their description and colors.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this tag?')) {
      setTags(prev => prev.filter(tag => tag.id !== id));
    }
  };

  const handleEditClick = (tag: any) => {
    setSelectedTag(tag);
    setNewTag({
      name: tag.name,
      description: tag.description,
      badgeColor: tag.badgeColor,
      fontColor: tag.fontColor
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-3 space-y-3 bg-gray-50 min-h-screen">
      {/* Search/Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tag Management</h2>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[rgba(253,14,14,1)] hover:bg-[#e00c0c] text-white h-9 text-sm font-semibold px-6"
          >
            CREATE
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Input
            placeholder="Search tag name or description..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="h-9 max-w-md"
          />
          <Button 
            onClick={handleSearch}
            className="bg-[#4caf50] hover:bg-[#45a049] text-white h-9 text-sm font-semibold px-6"
          >
            SEARCH
          </Button>
        </div>
      </div>

      {/* Tag List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Tag Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Created Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">View</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Badge style={{ backgroundColor: tag.badgeColor, color: tag.fontColor }} className="font-semibold px-3 py-1">
                      {tag.name.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs">
                    <p className="truncate" title={tag.description}>
                      {tag.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {tag.createdDate}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span className="underline">View</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(tag)}
                        className="bg-[#2196f3] text-white hover:bg-[#1976d2] border-[#2196f3] h-7 px-2"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id)}
                        className={`h-7 px-2 ${
                          tag.isPredefined 
                            ? 'bg-gray-400 text-white hover:bg-gray-500 border-gray-400 cursor-not-allowed' 
                            : 'bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]'
                        }`}
                        disabled={tag.isPredefined}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Tag Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold">CREATE TAG</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
              <Input
                value={newTag.name}
                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-9"
                placeholder="Enter custom tag name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={newTag.description}
                onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe the purpose of this tag... (optional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Color</label>
                <Input
                  type="color"
                  value={newTag.badgeColor}
                  onChange={(e) => setNewTag(prev => ({ ...prev, badgeColor: e.target.value }))}
                  className="w-full h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Color</label>
                <Input
                  type="color"
                  value={newTag.fontColor}
                  onChange={(e) => setNewTag(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="w-full h-9"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-3">
              <Button 
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleCreateTag}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
                disabled={!newTag.name}
              >
                CREATE TAG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#3949ab] font-semibold">EDIT TAG</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
              {selectedTag?.isPredefined ? (
                <Input
                  value={newTag.name}
                  disabled
                  className="w-full h-9 bg-gray-100 text-gray-500"
                />
              ) : (
                <Input
                  value={newTag.name}
                  onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-9"
                  placeholder="Enter custom tag name"
                />
              )}
              {selectedTag?.isPredefined && (
                <p className="text-xs text-gray-500 mt-1">Predefined tag names cannot be changed</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={newTag.description}
                onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Describe the purpose of this tag... (optional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Color</label>
                <Input
                  type="color"
                  value={newTag.badgeColor}
                  onChange={(e) => setNewTag(prev => ({ ...prev, badgeColor: e.target.value }))}
                  className="w-full h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Color</label>
                <Input
                  type="color"
                  value={newTag.fontColor}
                  onChange={(e) => setNewTag(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="w-full h-9"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-3">
              <Button 
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1 bg-[#f44336] text-white hover:bg-[#d32f2f] border-[#f44336]"
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleEditTag}
                className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white"
                disabled={!newTag.name}
              >
                UPDATE TAG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}