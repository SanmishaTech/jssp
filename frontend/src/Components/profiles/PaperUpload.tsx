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

// Define the type for a single paper entry
interface Paper {
  id: number;
  journal_title: string;
  research_topic: string;
  publication_identifier: string;
  volume: string;
  issue: string;
  year_of_publication: string;
  peer_reviewed: string;
  coauthor: string;
  certificate_path?: string;
  certificate_url?: string;
}

const PaperUpload = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    journal_title: '',
    research_topic: '',
    publication_identifier: '',
    volume: '',
    issue: '',
    year_of_publication: '',
    peer_reviewed: '',
    coauthor: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteCertificate, setDeleteCertificate] = useState(false);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('/api/staffPapers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status && response.data.data?.StaffPaper) {
        const eduPayload = response.data.data.StaffPaper;
        // If it is paginated, data may be under eduPayload.data
        const list = Array.isArray(eduPayload)
          ? eduPayload
          : Array.isArray(eduPayload.data)
            ? eduPayload.data
            : [];
        setPapers(list);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  };

  useEffect(() => {
    fetchPapers();
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
      journal_title: '',
      research_topic: '',
      publication_identifier: '',
      volume: '',
      issue: '',
      year_of_publication: '',
      peer_reviewed: '',
      coauthor: '',
    });
    setSelectedFile(null);
    setDeleteCertificate(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic required field validation
    if (!formData.journal_title.trim() || !formData.year_of_publication.trim()) {
      alert('Please fill in both Journal Title and Year of Publication.');
      return;
    }
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
        await axios.post(`/api/staffPapers/${editingId}?_method=PUT`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post('/api/staffPapers', fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      fetchPapers(); // Refresh
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving paper:', error);
      alert('Failed to save paper. Please check the console for details.');
    }
  };

  const handleEdit = (edu: Paper) => {
    setEditingId(edu.id);
    setFormData({
      journal_title: edu.journal_title,
      research_topic: edu.research_topic,
      publication_identifier: edu.publication_identifier,
      volume: edu.volume,
      issue: edu.issue,
      year_of_publication: edu.year_of_publication,
      peer_reviewed: edu.peer_reviewed,
      coauthor: edu.coauthor,
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
      await axios.delete(`/api/staffPapers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPapers();
    } catch (error) {
      console.error('Error deleting paper:', error);
      alert('Failed to delete paper');
    }
  };

  const handleViewCertificate = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paper Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Paper
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Paper' : 'Add New Paper'}</DialogTitle>
                <DialogDescription>
                  Enter the details of your paper. Click save when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="journal_title" className="text-right">
                      Journal Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="journal_title"
                      name="journal_title"
                      placeholder="e.g., International Journal of AI"
                      value={formData.journal_title}
                      onChange={handleChange}
                      required
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="research_topic" className="text-right">
                      Research Topic
                    </Label>
                    <Input
                      id="research_topic"
                      name="research_topic"
                      placeholder="e.g., Machine Learning"
                      value={formData.research_topic}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="publication_identifier" className="text-right">
                      Publication Identifier
                    </Label>
                    <Input
                      id="publication_identifier"
                      name="publication_identifier"
                      placeholder="ISSN / ISBN"
                      value={formData.publication_identifier}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="volume" className="text-right">
                      Volume
                    </Label>
                    <Input
                      id="volume"
                      name="volume"
                      type="number"
                      placeholder="e.g., 42"
                      value={formData.volume}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="issue" className="text-right">
                      Issue
                    </Label>
                    <Input
                      id="issue"
                      name="issue"
                      type="number"
                      placeholder="e.g., 3"
                      value={formData.issue}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year_of_publication" className="text-right">
                      Year of Publication <span className="text-red-500">*</span>
                    </Label>
                     <Input
                                        id="year_of_publication"
                                        name="year_of_publication"
                                        type="number"
                                        placeholder="YYYY"
                                        min={1900}
                                        value={formData.year_of_publication}
                                        onChange={handleChange}
                                        required
                                        className="col-span-3"
                                      />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="peer_reviewed" className="text-right">
                      Peer Reviewed
                    </Label>
                    <Input
                      id="peer_reviewed"
                      name="peer_reviewed"
                      placeholder="Enter Peer Reviewed"
                      value={formData.peer_reviewed}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="coauthor" className="text-right">
                      Coauthor
                    </Label>
                    <Input
                      id="coauthor"
                      name="coauthor"
                      placeholder="e.g., John Doe"
                      value={formData.coauthor}
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
                        {papers.find((e) => e.id === editingId)?.certificate_url ? (
                          <>
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => handleViewCertificate(papers.find((e) => e.id === editingId)!.certificate_url!)}
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
            {papers.map((paper) => (
              <TableRow key={paper.id}>
                <TableCell>{paper.journal_title}</TableCell>
                <TableCell>{paper.research_topic}</TableCell>
                <TableCell>{paper.publication_identifier}</TableCell>
                <TableCell>{paper.volume}</TableCell>
                <TableCell>{paper.issue}</TableCell>
                <TableCell>
                  {paper.certificate_url ? (
                    <Button variant="link" size="sm" onClick={() => handleViewCertificate(paper.certificate_url!)}>
                      View
                    </Button>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(paper)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(paper.id)}>
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

export default PaperUpload;