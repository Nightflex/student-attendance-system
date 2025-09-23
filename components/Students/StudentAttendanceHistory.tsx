"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, Download } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";

interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  className: string;
  date: string;
  timestamp: string;
  status: "present" | "late" | "absent";
}

interface AttendanceHistoryProps {
  studentId: string;
}

export function StudentAttendanceHistory({ studentId }: AttendanceHistoryProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  console.log("StudentID:"+studentId);

  // Fetch attendance from API
  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      setRecordsError(null);
      try {
        const res = await axios.get<{ success: boolean; data: AttendanceRecord[]; message?: string }>(
          `/api/student/${studentId}/attendance`
        );
        if (res.data.success) {
          setAttendanceRecords(res.data.data);
        } else {
          setRecordsError(res.data.message || "Failed to fetch attendance");
        }
      } catch (err: any) {
        console.error(err);
        setRecordsError("Error fetching attendance data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  const statistics = useMemo(() => {
    if (attendanceRecords.length === 0) {
      return { overallAttendance: 0, totalClasses: 0, attendedClasses: 0, thisWeekAttended: 0, thisWeekTotal: 0 };
    }

    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(r => r.status === "present" || r.status === "late").length;
    const overallAttendance = Math.round((attendedClasses / totalClasses) * 100);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekRecords = attendanceRecords.filter(r => new Date(r.date) >= oneWeekAgo);
    const thisWeekTotal = thisWeekRecords.length;
    const thisWeekAttended = thisWeekRecords.filter(r => r.status === "present" || r.status === "late").length;

    return { overallAttendance, totalClasses, attendedClasses, thisWeekAttended, thisWeekTotal };
  }, [attendanceRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "late": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "absent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleExport = () => {
    alert("Export functionality can be implemented here");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading attendance history...</span>
      </div>
    );
  }

  if (recordsError) {
    return <div className="text-center text-red-600 py-4">{recordsError}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Attendance</p>
                <p className="text-2xl font-bold text-green-600">{statistics.overallAttendance}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Classes Attended</p>
                <p className="text-2xl font-bold">{statistics.attendedClasses}/{statistics.totalClasses}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.thisWeekAttended}/{statistics.thisWeekTotal}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Your recent class attendance records</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={attendanceRecords.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records found.</p>
              <p className="text-sm mt-2">Your attendance records will appear here after classes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.slice(0, 10).map(record => (
                <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <h4 className="font-medium">{record.className} ({record.classId})</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{new Date(record.date).toLocaleDateString()}</span></div>
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
