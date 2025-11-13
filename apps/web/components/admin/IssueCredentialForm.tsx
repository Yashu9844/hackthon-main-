"use client";

import { useState, FormEvent } from "react";

interface IssueCredentialFormProps {
  onSuccess: () => void;
}

interface FormData {
  studentName: string;
  degree: string;
  university: string;
  graduationDate: string;
  studentId: string;
  pdfFile: File | null;
}

interface FormErrors {
  studentName?: string;
  degree?: string;
  university?: string;
  graduationDate?: string;
  studentId?: string;
  pdfFile?: string;
}

export function IssueCredentialForm({ onSuccess }: IssueCredentialFormProps) {
  const [formData, setFormData] = useState<FormData>({
    studentName: "",
    degree: "",
    university: "",
    graduationDate: "",
    studentId: "",
    pdfFile: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = "Student name is required";
    } else if (formData.studentName.trim().length < 2) {
      newErrors.studentName = "Student name must be at least 2 characters";
    } else if (formData.studentName.trim().length > 100) {
      newErrors.studentName = "Student name must be less than 100 characters";
    }

    if (!formData.degree.trim()) {
      newErrors.degree = "Degree is required";
    } else if (formData.degree.trim().length < 2) {
      newErrors.degree = "Degree must be at least 2 characters";
    }

    if (!formData.university.trim()) {
      newErrors.university = "University is required";
    } else if (formData.university.trim().length < 2) {
      newErrors.university = "University must be at least 2 characters";
    }

    if (!formData.graduationDate) {
      newErrors.graduationDate = "Graduation date is required";
    } else {
      const date = new Date(formData.graduationDate);
      const today = new Date();
      const minDate = new Date("1950-01-01");
      
      if (date > today) {
        newErrors.graduationDate = "Graduation date cannot be in the future";
      } else if (date < minDate) {
        newErrors.graduationDate = "Graduation date must be after 1950";
      }
    }

    if (formData.studentId && formData.studentId.trim().length > 50) {
      newErrors.studentId = "Student ID must be less than 50 characters";
    }

    if (formData.pdfFile) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (formData.pdfFile.size > maxSize) {
        newErrors.pdfFile = "PDF file must be less than 10MB";
      }
      if (formData.pdfFile.type !== "application/pdf") {
        newErrors.pdfFile = "Only PDF files are allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Prepare request body
      const requestBody = {
        studentName: formData.studentName.trim(),
        degree: formData.degree.trim(),
        university: formData.university.trim(),
        graduationDate: formData.graduationDate,
        studentId: formData.studentId.trim() || undefined,
      };

      const response = await fetch("http://localhost:8000/api/credentials/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to issue credential: ${response.statusText}`);
      }

      setSubmitSuccess(
        `Credential issued successfully! UID: ${data.attestationUID.slice(0, 10)}...`
      );
      
      // Reset form
      setFormData({
        studentName: "",
        degree: "",
        university: "",
        graduationDate: "",
        studentId: "",
        pdfFile: null,
      });

      // Call success callback
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to issue credential");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, pdfFile: file }));
    if (errors.pdfFile) {
      setErrors((prev) => ({ ...prev, pdfFile: undefined }));
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Issue New Credential
      </h2>

      {submitError && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-600 dark:text-green-400">{submitSuccess}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Name */}
        <div>
          <label
            htmlFor="studentName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Student Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="studentName"
            value={formData.studentName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, studentName: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.studentName
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            } dark:bg-gray-700 dark:text-white`}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
          {errors.studentName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.studentName}
            </p>
          )}
        </div>

        {/* Degree */}
        <div>
          <label
            htmlFor="degree"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Degree <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="degree"
            value={formData.degree}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, degree: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.degree
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            } dark:bg-gray-700 dark:text-white`}
            placeholder="Bachelor of Science in Computer Science"
            disabled={isSubmitting}
          />
          {errors.degree && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.degree}</p>
          )}
        </div>

        {/* University */}
        <div>
          <label
            htmlFor="university"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            University <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="university"
            value={formData.university}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, university: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.university
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            } dark:bg-gray-700 dark:text-white`}
            placeholder="Massachusetts Institute of Technology"
            disabled={isSubmitting}
          />
          {errors.university && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.university}
            </p>
          )}
        </div>

        {/* Graduation Date */}
        <div>
          <label
            htmlFor="graduationDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Graduation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="graduationDate"
            value={formData.graduationDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, graduationDate: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.graduationDate
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            } dark:bg-gray-700 dark:text-white`}
            disabled={isSubmitting}
          />
          {errors.graduationDate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.graduationDate}
            </p>
          )}
        </div>

        {/* Student ID (Optional) */}
        <div>
          <label
            htmlFor="studentId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Student ID (Optional)
          </label>
          <input
            type="text"
            id="studentId"
            value={formData.studentId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, studentId: e.target.value }))
            }
            className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
              errors.studentId
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            } dark:bg-gray-700 dark:text-white`}
            placeholder="STU-2024-001"
            disabled={isSubmitting}
          />
          {errors.studentId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.studentId}
            </p>
          )}
        </div>

        {/* PDF Upload (Optional) */}
        <div>
          <label
            htmlFor="pdfFile"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Degree Certificate PDF (Optional)
          </label>
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/20 dark:file:text-blue-400 ${
              errors.pdfFile ? "border-red-300" : ""
            }`}
            disabled={isSubmitting}
          />
          {errors.pdfFile && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.pdfFile}
            </p>
          )}
          {formData.pdfFile && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Selected: {formData.pdfFile.name} (
              {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                studentName: "",
                degree: "",
                university: "",
                graduationDate: "",
                studentId: "",
                pdfFile: null,
              });
              setErrors({});
              setSubmitError(null);
              setSubmitSuccess(null);
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Issuing..." : "Issue Credential"}
          </button>
        </div>
      </form>
    </div>
  );
}
