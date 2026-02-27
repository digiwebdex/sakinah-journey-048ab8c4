import { useState, useEffect } from "react";
import { useAllSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Type, FileText, Globe, Phone, Mail, MapPin, Languages } from "lucide-react";
import { toast } from "sonner";
import { Language } from "@/i18n/translations";

const inputClass = "w-full bg-secondary border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const SECTION_CONFIG: Record<string, { label: string; icon: any; fields: FieldConfig[] }> = {
  hero: {
    label: "Hero Section",
    icon: Type,
    fields: [
      { key: "badge", label: "Badge Text", type: "text", bilingual: true },
      { key: "heading_line1", label: "Heading Line 1", type: "text", bilingual: true },
      { key: "heading_line2", label: "Heading Line 2", type: "text", bilingual: true },
      { key: "heading_highlight", label: "Heading Highlight", type: "text", bilingual: true },
      { key: "subheading", label: "Subheading", type: "textarea", bilingual: true },
      { key: "cta_primary", label: "Primary Button Text", type: "text", bilingual: true },
      { key: "cta_secondary", label: "Secondary Button Text", type: "text", bilingual: true },
      { key: "stats", label: "Stats", type: "array", bilingual: true, arrayFields: [
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ]},
    ],
  },
  services: {
    label: "Services Section",
    icon: Globe,
    fields: [
      { key: "section_label", label: "Section Label", type: "text", bilingual: true },
      { key: "heading", label: "Heading", type: "text", bilingual: true },
      { key: "heading_highlight", label: "Heading Highlight", type: "text", bilingual: true },
      { key: "description", label: "Description", type: "textarea", bilingual: true },
      { key: "items", label: "Service Items", type: "array", bilingual: true, arrayFields: [
        { key: "icon", label: "Icon Name", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "text" },
      ]},
    ],
  },
  about: {
    label: "About Section",
    icon: FileText,
    fields: [
      { key: "section_label", label: "Section Label", type: "text", bilingual: true },
      { key: "heading", label: "Heading", type: "text", bilingual: true },
      { key: "heading_highlight", label: "Heading Highlight", type: "text", bilingual: true },
      { key: "description", label: "Description", type: "textarea", bilingual: true },
      { key: "reasons", label: "Reasons", type: "array", bilingual: true, arrayFields: [
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "text" },
      ]},
    ],
  },
  contact: {
    label: "Contact Section",
    icon: Phone,
    fields: [
      { key: "section_label", label: "Section Label", type: "text", bilingual: true },
      { key: "heading", label: "Heading", type: "text", bilingual: true },
      { key: "heading_highlight", label: "Heading Highlight", type: "text", bilingual: true },
      { key: "phone", label: "Phone", type: "text", bilingual: false },
      { key: "email", label: "Email", type: "text", bilingual: false },
      { key: "location", label: "Location", type: "text", bilingual: true },
      { key: "hours", label: "Working Hours", type: "text", bilingual: true },
    ],
  },
  footer: {
    label: "Footer",
    icon: MapPin,
    fields: [
      { key: "company_name", label: "Company Name", type: "text", bilingual: false },
      { key: "company_tagline", label: "Tagline", type: "text", bilingual: true },
      { key: "description", label: "Description", type: "textarea", bilingual: true },
      { key: "phone", label: "Phone", type: "text", bilingual: false },
      { key: "email", label: "Email", type: "text", bilingual: false },
      { key: "address", label: "Address", type: "text", bilingual: true },
      { key: "services_list", label: "Services List", type: "string_array", bilingual: true },
      { key: "developer_name", label: "Developer Name", type: "text", bilingual: false },
      { key: "developer_url", label: "Developer URL", type: "text", bilingual: false },
    ],
  },
  navbar: {
    label: "Navbar",
    icon: Globe,
    fields: [
      { key: "phone", label: "Phone Number", type: "text", bilingual: false },
      { key: "cta_text", label: "CTA Button Text", type: "text", bilingual: true },
    ],
  },
};

interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "array" | "string_array";
  bilingual?: boolean;
  arrayFields?: { key: string; label: string; type: string }[];
}

const AdminCmsEditor = () => {
  const { data: allContent, isLoading } = useAllSiteContent();
  const updateMutation = useUpdateSiteContent();
  const [editState, setEditState] = useState<Record<string, any>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>("hero");
  const [editLang, setEditLang] = useState<Language>("bn");

  useEffect(() => {
    if (allContent) {
      setEditState({ ...allContent });
    }
  }, [allContent]);

  // Helper to get the value for a field considering bilingual structure
  const getFieldValue = (sectionData: any, field: FieldConfig) => {
    if (!field.bilingual) {
      return sectionData?.[field.key] ?? "";
    }
    // Bilingual: stored as { en: {...}, bn: {...} } or legacy flat format
    const langData = sectionData?.[editLang];
    if (langData && langData[field.key] !== undefined) {
      return langData[field.key];
    }
    // Fallback to legacy flat format
    return sectionData?.[field.key] ?? "";
  };

  const setFieldValue = (section: string, field: FieldConfig, value: any) => {
    setEditState((prev) => {
      const sectionData = { ...prev[section] };
      if (!field.bilingual) {
        sectionData[field.key] = value;
      } else {
        if (!sectionData[editLang]) sectionData[editLang] = {};
        sectionData[editLang] = { ...sectionData[editLang], [field.key]: value };
      }
      return { ...prev, [section]: sectionData };
    });
  };

  const handleArrayItemChange = (section: string, field: FieldConfig, index: number, fieldKey: string, value: string) => {
    setEditState((prev) => {
      const sectionData = { ...prev[section] };
      if (field.bilingual) {
        if (!sectionData[editLang]) sectionData[editLang] = {};
        const arr = [...(sectionData[editLang][field.key] || sectionData[field.key] || [])];
        arr[index] = { ...arr[index], [fieldKey]: value };
        sectionData[editLang] = { ...sectionData[editLang], [field.key]: arr };
      } else {
        const arr = [...(sectionData[field.key] || [])];
        arr[index] = { ...arr[index], [fieldKey]: value };
        sectionData[field.key] = arr;
      }
      return { ...prev, [section]: sectionData };
    });
  };

  const handleAddArrayItem = (section: string, field: FieldConfig) => {
    const newItem: any = {};
    field.arrayFields!.forEach((f) => (newItem[f.key] = ""));
    setEditState((prev) => {
      const sectionData = { ...prev[section] };
      if (field.bilingual) {
        if (!sectionData[editLang]) sectionData[editLang] = {};
        const arr = [...(sectionData[editLang][field.key] || sectionData[field.key] || [])];
        arr.push(newItem);
        sectionData[editLang] = { ...sectionData[editLang], [field.key]: arr };
      } else {
        const arr = [...(sectionData[field.key] || [])];
        arr.push(newItem);
        sectionData[field.key] = arr;
      }
      return { ...prev, [section]: sectionData };
    });
  };

  const handleRemoveArrayItem = (section: string, field: FieldConfig, index: number) => {
    setEditState((prev) => {
      const sectionData = { ...prev[section] };
      if (field.bilingual) {
        if (!sectionData[editLang]) sectionData[editLang] = {};
        const arr = [...(sectionData[editLang][field.key] || sectionData[field.key] || [])];
        arr.splice(index, 1);
        sectionData[editLang] = { ...sectionData[editLang], [field.key]: arr };
      } else {
        const arr = [...(sectionData[field.key] || [])];
        arr.splice(index, 1);
        sectionData[field.key] = arr;
      }
      return { ...prev, [section]: sectionData };
    });
  };

  const handleStringArrayChange = (section: string, field: FieldConfig, value: string) => {
    const arr = value.split("\n").filter(Boolean);
    setFieldValue(section, field, arr);
  };

  const getArrayItems = (sectionData: any, field: FieldConfig) => {
    if (field.bilingual) {
      return sectionData?.[editLang]?.[field.key] || sectionData?.[field.key] || [];
    }
    return sectionData?.[field.key] || [];
  };

  const getStringArrayValue = (sectionData: any, field: FieldConfig) => {
    if (field.bilingual) {
      const arr = sectionData?.[editLang]?.[field.key] || sectionData?.[field.key] || [];
      return Array.isArray(arr) ? arr.join("\n") : "";
    }
    const arr = sectionData?.[field.key] || [];
    return Array.isArray(arr) ? arr.join("\n") : "";
  };

  const handleSave = (sectionKey: string) => {
    updateMutation.mutate({ sectionKey, content: editState[sectionKey] });
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-12">Loading content...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-lg font-bold">Website Content Manager</h3>
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <div className="flex bg-secondary rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setEditLang("bn")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${editLang === "bn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setEditLang("en")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${editLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">
        {editLang === "bn" ? "বাংলা কন্টেন্ট এডিট করছেন" : "Editing English content"} — 
        {editLang === "bn" ? " ভাষা-নির্দিষ্ট ফিল্ডগুলো 🇧🇩 চিহ্নিত" : " Language-specific fields marked with 🇧🇩/🇬🇧"}
      </p>

      {Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => {
        const isExpanded = expandedSection === sectionKey;
        const sectionData = editState[sectionKey] || {};
        const hasChanges = JSON.stringify(sectionData) !== JSON.stringify(allContent?.[sectionKey]);

        return (
          <div key={sectionKey} className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <config.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.fields.length} editable fields</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Unsaved</span>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border p-5 space-y-4">
                {config.fields.map((field) => {
                  const langFlag = field.bilingual ? (editLang === "bn" ? " 🇧🇩" : " 🇬🇧") : "";

                  return (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        {field.label}{langFlag}
                        {field.bilingual && (
                          <span className="text-[10px] ml-1 text-primary/60">({editLang === "bn" ? "বাংলা" : "English"})</span>
                        )}
                      </label>

                      {field.type === "text" && (
                        <input
                          className={inputClass}
                          value={getFieldValue(sectionData, field)}
                          onChange={(e) => setFieldValue(sectionKey, field, e.target.value)}
                          dir={editLang === "bn" ? "auto" : "ltr"}
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          className={inputClass}
                          rows={3}
                          value={getFieldValue(sectionData, field)}
                          onChange={(e) => setFieldValue(sectionKey, field, e.target.value)}
                          dir={editLang === "bn" ? "auto" : "ltr"}
                        />
                      )}

                      {field.type === "string_array" && (
                        <textarea
                          className={inputClass}
                          rows={4}
                          placeholder={editLang === "bn" ? "প্রতি লাইনে একটি আইটেম" : "One item per line"}
                          value={getStringArrayValue(sectionData, field)}
                          onChange={(e) => handleStringArrayChange(sectionKey, field, e.target.value)}
                          dir={editLang === "bn" ? "auto" : "ltr"}
                        />
                      )}

                      {field.type === "array" && field.arrayFields && (
                        <div className="space-y-3">
                          {getArrayItems(sectionData, field).map((item: any, idx: number) => (
                            <div key={idx} className="bg-secondary/30 rounded-lg p-3 flex gap-3 items-start">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {field.arrayFields!.map((af) => (
                                  <div key={af.key}>
                                    <label className="text-[10px] text-muted-foreground">{af.label}</label>
                                    <input
                                      className={inputClass}
                                      value={item[af.key] || ""}
                                      onChange={(e) => handleArrayItemChange(sectionKey, field, idx, af.key, e.target.value)}
                                      dir={editLang === "bn" ? "auto" : "ltr"}
                                    />
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => handleRemoveArrayItem(sectionKey, field, idx)}
                                className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md mt-4"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddArrayItem(sectionKey, field)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> {editLang === "bn" ? "আইটেম যোগ করুন" : "Add Item"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => handleSave(sectionKey)}
                  disabled={updateMutation.isPending}
                  className="bg-gradient-gold text-primary-foreground font-semibold py-2.5 px-6 rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? (editLang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...") : (editLang === "bn" ? "পরিবর্তন সংরক্ষণ করুন" : "Save Changes")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminCmsEditor;
