import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SupervisionDuty {
  id: number;
  exam_name: string;
  date: string;
  exam_time: string;
  course_name: string;
  subject_name: string;
  duration_minutes: number;
}

const Edittestcard = () => {
  const [supervisionDuties, setSupervisionDuties] = useState<SupervisionDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupervisionDuties = async () => {
      try {
        setLoading(true);
        const userString = localStorage.getItem("user");
        if (!userString) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }
        const user = JSON.parse(userString);
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const response = await axios.get('/api/supervision-duties', { headers });
        if (response.data && response.data.status && response.data.data && response.data.data.SupervisionDuties) {
          setSupervisionDuties(response.data.data.SupervisionDuties);
        } else {
          console.warn("Supervision duties not found in expected format, setting to empty.", response.data);
          setSupervisionDuties([]);
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch supervision duties.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisionDuties();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>My Supervision Duties</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Exam Time</TableHead>
                  <TableHead>Duration (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisionDuties.length > 0 ? (
                  supervisionDuties.map((duty) => (
                    <TableRow key={duty.id}>
                      <TableCell>{duty.exam_name}</TableCell>
                      <TableCell>{duty.subject_name}</TableCell>
                      <TableCell>{duty.date}</TableCell>
                      <TableCell>{duty.exam_time}</TableCell>
                      <TableCell>{duty.duration_minutes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No supervision duties found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Edittestcard;

