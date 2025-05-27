import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Loader2 } from "lucide-react";

interface DayOption {
  value: number;
  label: string;
}

interface WeeklyHolidayData {
  id: number;
  institute_id: number;
  holiday_days: number[];
  holiday_days_names: Record<string, string>;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const WeeklyHoliday = () => {
  const [holidayDays, setHolidayDays] = useState<number[]>([]);
  const [description, setDescription] = useState<string>("Weekly Holiday");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);

  // Day options (0 = Sunday, 1 = Monday, etc.)
  const dayOptions: DayOption[] = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  useEffect(() => {
    fetchWeeklyHolidays();
  }, []);

  const fetchWeeklyHolidays = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/weekly-holidays");
      
      if (response.data.status && response.data.data && response.data.data.WeeklyHoliday) {
        const weeklyHoliday: WeeklyHolidayData = response.data.data.WeeklyHoliday;
        setHolidayDays(weeklyHoliday.holiday_days || []);
        setDescription(weeklyHoliday.description || "Weekly Holiday");
        setIsActive(weeklyHoliday.is_active);
      }
    } catch (error) {
      console.error("Error fetching weekly holidays:", error);
      toast.error("Failed to load weekly holidays");
    } finally {
      setLoading(false);
    }
  };

  const saveWeeklyHolidays = async () => {
    try {
      setSaving(true);
      const response = await axios.post("/api/weekly-holidays", {
        holiday_days: holidayDays,
        description,
        is_active: isActive
      });

      if (response.data.status) {
        toast.success("Weekly holidays updated successfully");
      }
    } catch (error) {
      console.error("Error saving weekly holidays:", error);
      toast.error("Failed to update weekly holidays");
    } finally {
      setSaving(false);
    }
  };

  const toggleWeeklyHoliday = async () => {
    try {
      setToggling(true);
      const response = await axios.put("/api/weekly-holidays/toggle");

      if (response.data.status && response.data.data && response.data.data.WeeklyHoliday) {
        const weeklyHoliday: WeeklyHolidayData = response.data.data.WeeklyHoliday;
        setIsActive(weeklyHoliday.is_active);
        toast.success(`Weekly holidays ${weeklyHoliday.is_active ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error) {
      console.error("Error toggling weekly holidays:", error);
      toast.error("Failed to toggle weekly holidays");
    } finally {
      setToggling(false);
    }
  };

  const handleDayToggle = (dayValue: number) => {
    setHolidayDays((prevDays) => {
      if (prevDays.includes(dayValue)) {
        return prevDays.filter((day) => day !== dayValue);
      } else {
        return [...prevDays, dayValue];
      }
    });
  };

  const getSelectedDaysText = () => {
    if (holidayDays.length === 0) return "No days selected";
    
    const selectedDayNames = holidayDays
      .sort((a, b) => a - b)
      .map(dayValue => dayOptions.find(day => day.value === dayValue)?.label || "");
    
    return selectedDayNames.join(", ");
  };

  return (
    <div className="flex justify-center items-start pt-16 min-h-screen">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-lg shadow-md p-6">
        <div className="space-y-2 pb-4">
          <h2 className="text-2xl font-bold">Weekly Holidays</h2>
          <p className="text-sm text-gray-500">
            Select the days of the week that should be considered holidays
          </p>
        </div>
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              

              

              <div className="mb-4">
                <Label className="mb-2 block font-medium">Currently Selected Holiday Days</Label>
                <div className="p-3 bg-slate-50 rounded-md text-sm">
                  {getSelectedDaysText()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {dayOptions.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={holidayDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label
                      htmlFor={`day-${day.value}`}
                      className="text-base font-medium"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>

              <Button
                onClick={saveWeeklyHolidays}
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Weekly Holidays"
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyHoliday;
