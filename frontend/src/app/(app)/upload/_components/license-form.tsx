"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign, Globe, Info, Scale } from "lucide-react";
import { useState } from "react";

interface LicenseFormData {
  type: string;
  price: string;
  usage: string;
  territory: string;
}

interface LicenseFormProps {
  initialData?: LicenseFormData;
  onSubmit: (license: LicenseFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const LICENSE_TYPES = [
  {
    id: "standard",
    name: "Standard License",
    description:
      "For personal projects, small businesses, and independent creators",
    features: [
      "Up to 1M views/streams",
      "Social media use",
      "YouTube monetization",
      "Podcast use",
    ],
    recommended: true,
  },
  {
    id: "commercial",
    name: "Commercial License",
    description:
      "For commercial use, advertising, and large-scale distribution",
    features: [
      "Unlimited views/streams",
      "Commercial advertising",
      "TV/Film sync",
      "Resale rights",
    ],
    recommended: false,
  },
  {
    id: "exclusive",
    name: "Exclusive License",
    description: "Full exclusive rights to the track",
    features: [
      "Complete ownership transfer",
      "Exclusive usage rights",
      "Modification rights",
      "Publishing rights",
    ],
    recommended: false,
  },
];

const USAGE_TYPES = [
  { id: "single", name: "Single Use", description: "One project only" },
  {
    id: "multiple",
    name: "Multiple Uses",
    description: "Multiple projects allowed",
  },
  { id: "unlimited", name: "Unlimited", description: "No usage restrictions" },
];

const TERRITORIES = [
  { id: "worldwide", name: "Worldwide" },
  { id: "us", name: "United States" },
  { id: "eu", name: "European Union" },
  { id: "custom", name: "Custom Territory" },
];

export default function LicenseForm({
  initialData,
  onSubmit,
  onNext,
  onBack,
}: LicenseFormProps) {
  const [formData, setFormData] = useState<LicenseFormData>({
    type: initialData?.type || "standard",
    price: initialData?.price || "",
    usage: initialData?.usage || "multiple",
    territory: initialData?.territory || "worldwide",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [includeRoyalties, setIncludeRoyalties] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (
      Number.isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      newErrors.price = "Please enter a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      // onNext is called automatically by parent
    }
  };

  const getSelectedLicense = () => {
    return LICENSE_TYPES.find((license) => license.id === formData.type);
  };

  const getSuggestedPrice = () => {
    switch (formData.type) {
      case "standard":
        return "50";
      case "commercial":
        return "200";
      case "exclusive":
        return "1000";
      default:
        return "50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">License Terms</h2>
        <p className="text-muted-foreground">
          Set your licensing terms and pricing for your track
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* License Type Selection */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">License Type</Label>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            {LICENSE_TYPES.map((license) => (
              <div key={license.id} className="relative">
                <div
                  className={`flex items-start space-x-3 rounded-lg border p-4 transition-all ${
                    formData.type === license.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value={license.id} className="mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{license.name}</h4>
                      {license.recommended && (
                        <Badge variant="default" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {license.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {license.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">Pricing (USD)</Label>
          <div className="space-y-3">
            <div className="relative">
              <DollarSign className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="Enter price"
                className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                type="number"
                min="0"
                step="0.01"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price}</p>
            )}
            <p className="text-muted-foreground text-sm">
              Suggested price for {getSelectedLicense()?.name}: $
              {getSuggestedPrice()}
            </p>
          </div>
        </div>

        {/* Usage Rights */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">Usage Rights</Label>
          <RadioGroup
            value={formData.usage}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, usage: value }))
            }
          >
            {USAGE_TYPES.map((usage) => (
              <div
                key={usage.id}
                className={`flex items-center space-x-3 rounded-lg border p-3 ${
                  formData.usage === usage.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <RadioGroupItem value={usage.id} />
                <div className="flex-1">
                  <h5 className="font-medium">{usage.name}</h5>
                  <p className="text-muted-foreground text-sm">
                    {usage.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Territory */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">Territory</Label>
          <RadioGroup
            value={formData.territory}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, territory: value }))
            }
          >
            {TERRITORIES.map((territory) => (
              <div
                key={territory.id}
                className={`flex items-center space-x-3 rounded-lg border p-3 ${
                  formData.territory === territory.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <RadioGroupItem value={territory.id} />
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{territory.name}</span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Additional Options */}
        <div className="space-y-4">
          <Label className="font-semibold text-base">Additional Options</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="royalties"
                checked={includeRoyalties}
                onCheckedChange={(checked) => setIncludeRoyalties(!!checked)}
              />
              <Label htmlFor="royalties" className="text-sm">
                Include ongoing royalties (5% of licensee revenue)
              </Label>
            </div>
          </div>
        </div>

        {/* License Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              License Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">
                  License Type:
                </span>
                <p className="font-medium">{getSelectedLicense()?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Price:</span>
                <p className="font-medium">${formData.price || "0"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Usage:</span>
                <p className="font-medium">
                  {USAGE_TYPES.find((u) => u.id === formData.usage)?.name}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">
                  Territory:
                </span>
                <p className="font-medium">
                  {TERRITORIES.find((t) => t.id === formData.territory)?.name}
                </p>
              </div>
            </div>

            {includeRoyalties && (
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-primary text-sm">
                  <Info className="mr-1 inline h-3 w-3" />
                  Ongoing royalties: 5% of licensee revenue will be
                  automatically distributed to you
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            ← Back
          </Button>

          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Continue →
          </Button>
        </div>
      </form>
    </div>
  );
}
