import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define the type for a single education entry
interface Education {
  id: number;
  qualification: string;
  college_name: string;
  board_university: string;
  passing_year: string;
  percentage: string;
  certificate_path?: string;
  certificate_url?: string;
}

const EducationQualifications = () => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    qualification: '',
    college_name: '',
    board_university: '',
    passing_year: '',
    percentage: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteCertificate, setDeleteCertificate] = useState(false);

  const fetchEducations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('/api/staffEducations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status && response.data.data?.StaffEducation) {
        const eduPayload = response.data.data.StaffEducation;
        // If it is paginated, data may be under eduPayload.data
        const list = Array.isArray(eduPayload)
          ? eduPayload
          : Array.isArray(eduPayload.data)
            ? eduPayload.data
            : [];
        setEducations(list);
      }
    } catch (error) {
      console.error('Error fetching education qualifications:', error);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'certificate') {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type !== 'application/pdf') {
          alert('Please select a PDF file');
          (e.target as HTMLInputElement).value = '';
          return;
        }
        setSelectedFile(file);
      }
      return;
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      qualification: '',
      college_name: '',
      board_university: '',
      passing_year: '',
      percentage: '',
    });
    setSelectedFile(null);
    setDeleteCertificate(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });
      if (selectedFile) {
        fd.append('certificate', selectedFile);
      }
      if (deleteCertificate) {
        fd.append('delete_certificate', '1');
      }

      if (editingId) {
        await axios.post(`/api/staffEducations/${editingId}?_method=PUT`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post('/api/staffEducations', fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      fetchEducations(); // Refresh
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving education qualification:', error);
      alert('Failed to save qualification. Please check the console for details.');
    }
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    setFormData({
      qualification: edu.qualification,
      college_name: edu.college_name,
      board_university: edu.board_university,
      passing_year: edu.passing_year,
      percentage: edu.percentage,
    });
    setSelectedFile(null);
    setDeleteCertificate(false);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDel = window.confirm('Are you sure you want to delete this qualification?');
    if (!confirmDel) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.delete(`/api/staffEducations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEducations();
    } catch (error) {
      console.error('Error deleting qualification:', error);
      alert('Failed to delete qualification');
    }
  };

  const handleViewCertificate = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Educational Qualifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Qualification
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Qualification' : 'Add New Qualification'}</DialogTitle>
                <DialogDescription>
                  Enter the details of your qualification. Click save when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="qualification" className="text-right">
                      Qualification
                    </Label>
                    <Input
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="college_name" className="text-right">
                      College Name
                    </Label>
                    <Input
                      id="college_name"
                      name="college_name"
                      value={formData.college_name}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="board_university" className="text-right">
                      Board/University
                    </Label>
                    <Input
                      id="board_university"
                      name="board_university"
                      value={formData.board_university}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="passing_year" className="text-right">
                      Passing Year
                    </Label>
                    <Input
                      id="passing_year"
                      name="passing_year"
                      value={formData.passing_year}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="percentage" className="text-right">
                      Percentage
                    </Label>
                    <Input
                      id="percentage"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="certificate" className="text-right">
                      Certificate
                    </Label>
                    <Input
                      id="certificate"
                      name="certificate"
                      type="file"
                      accept="application/pdf"
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  {editingId && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Current</Label>
                      <div className="col-span-3 flex items-center gap-2">
                        {educations.find((e) => e.id === editingId)?.certificate_url ? (
                          <>
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => handleViewCertificate(educations.find((e) => e.id === editingId)!.certificate_url!)}
                            >
                              View
                            </Button>
                            <Label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={deleteCertificate}
                                onChange={(e) => setDeleteCertificate(e.target.checked)}
                              />
                              <span>Delete</span>
                            </Label>
                          </>
                        ) : (
                          <span>No certificate</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Qualification</TableHead>
              <TableHead>College Name</TableHead>
              <TableHead>Board/University</TableHead>
              <TableHead>Passing Year</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {educations.map((edu) => (
              <TableRow key={edu.id}>
                <TableCell>{edu.qualification}</TableCell>
                <TableCell>{edu.college_name}</TableCell>
                <TableCell>{edu.board_university}</TableCell>
                <TableCell>{edu.passing_year}</TableCell>
                <TableCell>{edu.percentage}</TableCell>
                <TableCell>
                  {edu.certificate_url ? (
                    <Button variant="link" size="sm" onClick={() => handleViewCertificate(edu.certificate_url!)}>
                      View
                    </Button>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(edu)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(edu.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EducationQualifications;