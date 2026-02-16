"use client";

import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Textarea, Select } from "../ui/Input";
import { Form, FormGroup, FormRow, FormActions } from "../ui/Form";
import { Heading, Text } from "../ui/Typography";
import { SuccessAlert } from "../ui";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (eventData: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  loading?: boolean;
  error?: string | null;
  editMode?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location_name: string;
  location_address: string;
  participant_limit: number;
  visibility: 'public' | 'private';
  allow_comments: boolean;
}

export function CreateEventModal({ isOpen, onClose, onSubmit, initialData, loading: externalLoading, error: externalError, editMode }: CreateEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>(() => ({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    date: initialData?.date ?? "",
    time: initialData?.time ?? "",
    location_name: initialData?.location_name ?? "",
    location_address: initialData?.location_address ?? "",
    participant_limit: initialData?.participant_limit ?? 0,
    visibility: initialData?.visibility ?? 'public',
    allow_comments: initialData?.allow_comments ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Übernehme initialData beim Öffnen
  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        date: initialData.date ?? "",
        time: initialData.time ?? "",
        location_name: initialData.location_name ?? "",
        location_address: initialData.location_address ?? "",
        participant_limit: initialData.participant_limit ?? 0,
        visibility: initialData.visibility ?? 'public',
        allow_comments: initialData.allow_comments ?? true,
      });
    } else if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location_name: "",
        location_address: "",
        participant_limit: 0,
        visibility: 'public',
        allow_comments: true,
      });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]);

  const effectiveLoading = typeof externalLoading === 'boolean' ? externalLoading : loading;
  const effectiveError = externalError || null;

  const handleInputChange = (field: keyof EventFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Titel ist erforderlich";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Beschreibung ist erforderlich";
    }

    if (!formData.date) {
      newErrors.date = "Datum ist erforderlich";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Datum muss in der Zukunft liegen";
      }
    }

    if (formData.participant_limit < 0) {
      newErrors.participant_limit = "Teilnehmerzahl muss positiv sein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Format data for backend
      const backendData = {
        title: formData.title,
        description: formData.description,
        location_name: formData.location_name,
        location_address: formData.location_address,
        participant_limit: formData.participant_limit === 0 ? null : formData.participant_limit,
        visibility: formData.visibility,
        allow_comments: formData.allow_comments,
        starts_at: `${formData.date}T${formData.time || '18:00'}:00+01:00`,
        ends_at: null, // Backend kann das optional handhaben
      };
      
      if (onSubmit) {
        await onSubmit(backendData as any);
      }
      // Erfolgsmeldung anzeigen
      setShowSuccess(true);
      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location_name: "",
        location_address: "",
        participant_limit: 0,
        visibility: 'public',
        allow_comments: true,
      });
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1800);
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location_name: "",
      location_address: "",
      participant_limit: 0,
      visibility: 'public',
      allow_comments: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" className="!bg-white !rounded-2xl !shadow-2xl border border-blue-100">
      <ModalHeader onClose={handleClose} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl px-8 py-6 border-b-0">
        <Heading level={2} className="text-blue-900 font-extrabold text-3xl">
          {editMode ? "Event bearbeiten" : "Neues Event erstellen"}
        </Heading>
      </ModalHeader>
      <ModalBody className="px-8 py-8">
        {showSuccess && (
          <div className="mb-4">
            <SuccessAlert dismissible onDismiss={() => setShowSuccess(false)}>
              {editMode ? "Event wurde erfolgreich bearbeitet!" : "Event wurde erfolgreich erstellt!"}
            </SuccessAlert>
          </div>
        )}
        {effectiveError && (
          <div className="mb-4">
            <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">{effectiveError}</div>
          </div>
        )}
        <Form onSubmit={handleSubmit} className="space-y-7">
          <FormGroup>
            <Input
              label="Event-Titel *"
              placeholder="z.B. Geburtstagsfeier"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              error={errors.title}
              className="rounded-xl"
            />
          </FormGroup>
          <FormGroup>
            <Textarea
              label="Beschreibung *"
              placeholder="Beschreiben Sie Ihr Event..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={errors.description}
              className="rounded-xl"
            />
          </FormGroup>
          <FormRow className="gap-6">
            <FormGroup>
              <Input
                label="Datum *"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                error={errors.date}
                className="rounded-xl"
              />
            </FormGroup>
            <FormGroup>
              <Input
                label="Uhrzeit *"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="rounded-xl"
              />
            </FormGroup>
          </FormRow>
          <FormGroup>
            <Input
              label="Ortsname *"
              placeholder="z.B. Restaurant XYZ"
              value={formData.location_name}
              onChange={(e) => handleInputChange("location_name", e.target.value)}
              className="rounded-xl"
            />
          </FormGroup>
          <FormGroup>
            <Input
              label="Adresse *"
              placeholder="z.B. Musterstrasse 123, 8001 Zürich"
              value={formData.location_address}
              onChange={(e) => handleInputChange("location_address", e.target.value)}
              className="rounded-xl"
            />
          </FormGroup>
          <FormRow className="gap-6">
            <FormGroup>
              <Input
                label="Max. Teilnehmer"
                type="number"
                min="0"
                value={formData.participant_limit === 0 ? "" : formData.participant_limit.toString()}
                placeholder={formData.participant_limit === 0 ? "unbegrenzt" : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange("participant_limit", value === "" ? 0 : parseInt(value) || 0);
                }}
                error={errors.participant_limit}
                className="rounded-xl"
              />
            </FormGroup>
            <FormGroup>
              <Select
                label="Sichtbarkeit"
                value={formData.visibility}
                onChange={(e) => handleInputChange("visibility", e.target.value as 'public' | 'private')}
                options={[
                  { value: "public", label: "Öffentlich" },
                  { value: "private", label: "Privat" }
                ]}
                className="rounded-xl"
              />
            </FormGroup>
          </FormRow>
        </Form>
      </ModalBody>
      <ModalFooter className="px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-b-2xl border-t-0">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={loading}
          className="rounded-full px-6 py-2 text-base font-semibold border-blue-300 text-blue-800 hover:bg-blue-50"
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={effectiveLoading}
          onClick={handleSubmit}
          className="rounded-full px-6 py-2 text-base font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-md"
        >
          {editMode ? "Speichern" : "Event erstellen"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
