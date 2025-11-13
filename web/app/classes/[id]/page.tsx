"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface StudentMetric {
  studentId: string;
  studentName: string;
  avgScorePct: number;
  sessionsThisWeek: number;
  avgAccuracyPct: number;
  recentMood: number | null;
}

interface ClassSummary {
  avgAccuracy: number;
  activeStudents: number;
  lowMoodStudents: number;
  dueAssignments: number;
}

interface Assignment {
  id: string;
  title: string;
  topic: string;
  dueAt: string;
  timeEstimateMin: number;
}

export default function ClassDetailPage() {
  const [metrics, setMetrics] = useState<StudentMetric[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxMood, setMaxMood] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "assignments">(
    "students"
  );

  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchClassData();
    fetchAssignments();
  }, [classId, router]);

  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/classes/${classId}/metrics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setSummary(data.summary);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      } else {
        setError("Failed to load class data");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/classes/${classId}/assignments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error("Failed to load assignments");
    }
  };

  const filteredMetrics = metrics.filter((metric) => {
    if (minScore && metric.avgScorePct < parseFloat(minScore)) return false;
    if (
      maxMood &&
      metric.recentMood !== null &&
      metric.recentMood > parseInt(maxMood)
    )
      return false;
    return true;
  });

  const handleCreateAssignment = () => {
    router.push(`/classes/${classId}/assignments/new`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Get assignments due in next 7 days
  const dueAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.dueAt);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= sevenDaysFromNow;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #4f46e5 2px, transparent 0),
                              radial-gradient(circle at 75px 75px, #4f46e5 2px, transparent 0)`,
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>

        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading class data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #4f46e5 2px, transparent 0),
                            radial-gradient(circle at 75px 75px, #4f46e5 2px, transparent 0)`,
            backgroundSize: "100px 100px",
          }}
        ></div>
      </div>

      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px),
                         linear-gradient(90deg, #4f46e5 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shrink-0 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link
                href="/classes"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-200 hover:bg-slate-100/50 px-3 py-2 rounded-xl backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Classes</span>
              </Link>
              <div className="w-px h-6 bg-slate-300/50"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                MentorMind
              </h1>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600 font-medium">Class Details</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreateAssignment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Create Assignment</span>
              </button>

              <div className="w-px h-6 bg-slate-300/50"></div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-start space-x-3 animate-in slide-in-from-top duration-500 relative overflow-hidden">
            {/* Background pattern for error */}
            <div className="absolute inset-0 opacity-5 bg-red-500"></div>
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-red-800 font-medium">
                Unable to load class data
              </h3>
              <p className="text-red-600 text-sm mt-1">
                Please check your connection and try again.
              </p>
            </div>
          </div>
        )}

        {/* Class Summary - Top Metrics */}
        {summary && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Avg Accuracy Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Avg Accuracy
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.avgAccuracy}%
                  </p>
                </div>
              </div>
            </div>

            {/* Active Students Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Active Students
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.activeStudents}
                  </p>
                  <p className="text-xs text-slate-500">
                    ≥2 sessions this week
                  </p>
                </div>
              </div>
            </div>

            {/* Low Mood Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Low Mood</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.lowMoodStudents}
                  </p>
                  <p className="text-xs text-slate-500">Mood score ≤ 2</p>
                </div>
              </div>
            </div>

            {/* Due Assignments Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Due Next 7d
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {dueAssignments.length}
                  </p>
                  <p className="text-xs text-slate-500">Assignments due soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-1 shadow-sm relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30"></div>
            <nav className="flex space-x-1 relative z-10">
              <button
                onClick={() => setActiveTab("students")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden ${
                  activeTab === "students"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                {activeTab === "students" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                <span className="relative z-10">Student Roster</span>
              </button>
              <button
                onClick={() => setActiveTab("assignments")}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all duration-200 relative overflow-hidden ${
                  activeTab === "assignments"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                {activeTab === "assignments" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                <span className="relative z-10">
                  Assignments ({assignments.length})
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Student Roster Tab */}
        {activeTab === "students" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative">
            {/* Card background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20"></div>

            <div className="px-8 py-6 border-b border-slate-200/60 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 lg:mb-0">
                  Student Roster & Metrics
                </h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-slate-700 font-medium">
                      Min Score:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={minScore}
                      onChange={(e) => setMinScore(e.target.value)}
                      className="border border-slate-300 rounded-xl px-3 py-2 text-slate-500 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white/50"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-slate-700 font-medium">
                      Max Mood:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="1"
                      value={maxMood}
                      onChange={(e) => setMaxMood(e.target.value)}
                      className="border border-slate-300 rounded-xl px-3 py-2 text-slate-500 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm bg-white/50"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Sessions (7d)
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Avg Accuracy
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                      Recent Mood
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {filteredMetrics.map((metric) => (
                    <tr
                      key={metric.studentId}
                      className="hover:bg-slate-50/50 transition-colors duration-150 group"
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                        {metric.studentName}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 backdrop-blur-sm">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${metric.avgScorePct}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">
                            {metric.avgScorePct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 backdrop-blur-sm">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">
                            {metric.sessionsThisWeek}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                        {metric.avgAccuracyPct}%
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        {metric.recentMood ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                              metric.recentMood >= 4
                                ? "bg-green-100 text-green-800 border border-green-200 group-hover:scale-105"
                                : metric.recentMood >= 3
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200 group-hover:scale-105"
                                : "bg-red-100 text-red-800 border border-red-200 group-hover:scale-105"
                            }`}
                          >
                            {metric.recentMood}/5
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMetrics.length === 0 && (
              <div className="text-center py-12 text-slate-500 relative z-10">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/50">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-600">
                  No students match the current filters.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your filter criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative">
            {/* Card background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-blue-50/20"></div>

            <div className="px-8 py-6 border-b border-slate-200/60 relative z-10">
              <h2 className="text-2xl font-bold text-slate-900">
                Class Assignments
              </h2>
              <p className="text-slate-600 mt-1">
                {assignments.length} assignment(s) total •{" "}
                {dueAssignments.length} due in next 7 days
              </p>
            </div>

            <div className="overflow-x-auto relative z-10">
              {assignments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/50">
                    <svg
                      className="w-10 h-10 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    No assignments yet
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Create your first assignment to get started
                  </p>
                  <button
                    onClick={handleCreateAssignment}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <svg
                      className="w-5 h-5 relative z-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="relative z-10">
                      Create First Assignment
                    </span>
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Time Estimate
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {assignments.map((assignment) => {
                      const dueDate = new Date(assignment.dueAt);
                      const now = new Date();
                      const isOverdue = dueDate < now;
                      const isDueSoon =
                        dueDate >= now &&
                        dueDate <=
                          new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                      return (
                        <tr
                          key={assignment.id}
                          className="hover:bg-slate-50/50 transition-colors duration-150 group"
                        >
                          <td className="px-8 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                            {assignment.title}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                            {assignment.topic}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 backdrop-blur-sm">
                                <svg
                                  className="w-4 h-4 text-slate-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <span>
                                {dueDate.toLocaleDateString()} at{" "}
                                {dueDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-700">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 backdrop-blur-sm">
                                <svg
                                  className="w-4 h-4 text-slate-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <span className="font-medium">
                                {assignment.timeEstimateMin} min
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 group-hover:scale-105 ${
                                isOverdue
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : isDueSoon
                                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                  : "bg-green-100 text-green-800 border border-green-200"
                              }`}
                            >
                              {isOverdue
                                ? "Overdue"
                                : isDueSoon
                                ? "Due Soon"
                                : "Upcoming"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-white/20 mt-auto shrink-0 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-slate-600 text-sm font-medium">
                © {new Date().getFullYear()} MentorMind. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-slate-500">
              <a
                href="#"
                className="hover:text-slate-700 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-slate-700 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-slate-700 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
