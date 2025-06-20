import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  available: boolean;
  created_at: string;
  image_url: string | null;
}

export function MenuManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchMenuItems();
      subscribeToMenuChanges();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('mom_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform and validate the data
      const validMenuItems = data?.filter(item => 
        item.title && item.description !== null && item.price !== null && item.available !== null
      ).map(item => ({
        id: item.id,
        title: item.title!,
        description: item.description || '',
        price: item.price!,
        available: item.available!,
        created_at: item.created_at || new Date().toISOString(),
        image_url: item.image_url
      })) || [];
      
      setMenuItems(validMenuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    }
  };

  const subscribeToMenuChanges = () => {
    if (!user) return;
    
    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu',
          filter: `mom_id=eq.${user.id}`,
        },
        () => {
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      let imageUrl = editingItem?.image_url || null;

      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
        
        // If editing and there's a new file, upload it.
        // If there was an old file, we could delete it here, but for now we'll just upload the new one.
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      }

      const itemData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        available: formData.available,
        mom_id: user.id,
        image_url: imageUrl,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('menu')
          .insert([itemData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Menu item added successfully",
        });
      }

      setFormData({ title: "", description: "", price: "", available: true });
      setImageFile(null);
      setIsAddingItem(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu')
        .update({ available: !item.available })
        .eq('id', item.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Item ${!item.available ? 'marked as available' : 'marked as unavailable'}`,
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price.toString(),
      available: item.available,
    });
    setImageFile(null);
    setIsAddingItem(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button
          onClick={() => setIsAddingItem(true)}
          className="gap-2 bg-gradient-to-r from-warm-orange-500 to-warm-orange-600 hover:from-warm-orange-600 hover:to-warm-orange-700"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {isAddingItem && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Item' : 'Add New Menu Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="file:bg-warm-orange-100 file:text-warm-orange-700 file:border-0 file:px-4 file:py-2 file:rounded-md file:mr-4 hover:file:bg-warm-orange-200"
                />
                {editingItem?.image_url && !imageFile && (
                  <div className="mt-2">
                    <img src={editingItem.image_url} alt={editingItem.title} className="w-24 h-24 object-cover rounded-md mt-1" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600">
                  {editingItem ? 'Update' : 'Add'} Item
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItem(null);
                    setFormData({ title: "", description: "", price: "", available: true });
                    setImageFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow animate-fade-in flex flex-col sm:flex-row overflow-hidden">
            {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full sm:w-48 h-48 sm:h-auto object-cover" />
              ) : (
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-200 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
            )}
            <CardContent className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <p className="text-xl font-bold text-green-600">₹{item.price}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAvailability(item)}
                    className={item.available ? "text-red-600" : "text-green-600"}
                  >
                    {item.available ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
