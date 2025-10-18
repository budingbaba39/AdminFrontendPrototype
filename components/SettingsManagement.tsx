import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import ReactSelect, { GroupBase, MultiValue } from 'react-select';


type Option = { value: string; label: string };
type LanguageOption = Option;


const countryOptions: (Option & { dial: string })[] = [
  { value: 'Malaysia', label: 'Malaysia', dial: '+60' },
  { value: 'Singapore', label: 'Singapore', dial: '+65' },
  { value: 'Thailand', label: 'Thailand', dial: '+66' },
  { value: 'Indonesia', label: 'Indonesia', dial: '+62' },
  { value: 'Nepal', label: 'Nepal', dial: '+977' },
  { value: 'Myanmar', label: 'Myanmar', dial: '+95' },
];

const allLanguageOptions: LanguageOption[] = [
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Malay', label: 'Malay' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Nepali', label: 'Nepali' },
  { value: 'Burmese', label: 'Burmese' },
  { value: 'Indonesian', label: 'Indonesian' },
];

const currencyOptions: Option[] = [
  { value: 'MYR', label: 'MYR' },
  { value: 'SGD', label: 'SGD' },
  { value: 'THB', label: 'THB' },
  { value: 'IDR', label: 'IDR' },
  { value: 'NPR', label: 'NPR' },
  { value: 'MMK', label: 'MMK' },
  { value: 'USD', label: 'USD' },
];

const countryLanguages: Record<string, string[]> = {
  Malaysia: ['Malay', 'English', 'Chinese'],
  Singapore: ['English', 'Chinese', 'Malay'],
  Thailand: ['Thai', 'English'],
  Indonesia: ['Indonesian', 'English'],
  Nepal: ['Nepali', 'English'],
  Myanmar: ['Burmese', 'English'],
};

const countryCurrency: Record<string, string> = {
  Malaysia: 'MYR',
  Singapore: 'SGD',
  Thailand: 'THB',
  Indonesia: 'IDR',
  Nepal: 'NPR',
  Myanmar: 'MMK',
};

const countryTimezones: Record<string, string[]> = {
  Malaysia: ['Asia/Kuala_Lumpur', 'Asia/Kuching'],
  Singapore: ['Asia/Singapore'],
  Thailand: ['Asia/Bangkok'],
  Indonesia: ['Asia/Jakarta', 'Asia/Pontianak', 'Asia/Makassar', 'Asia/Jayapura'],
  Nepal: ['Asia/Kathmandu'],
  Myanmar: ['Asia/Yangon'],
};

function splitPrimaryOther(all: Option[], primaryValues: string[]) {
  const primarySet = new Set(primaryValues);
  const primary = all.filter(o => primarySet.has(o.value));
  const other = all.filter(o => !primarySet.has(o.value));
  return { primary, other };
}

function toOptions(values: string[]): Option[] {
  return values.map(v => ({ value: v, label: v }));
}


export default function SystemSettingsOnly() {
  const [systemSettings, setSystemSettings] = useState({
    languages: ['English'],
    currency: 'MYR',
    country: 'Malaysia',
    timezone: 'Asia/Kuala_Lumpur',
    mobileCountryCode: '+60',
    hideMobileNumber: 'No',
    smsLimitPerDay: 100,
    displayLiveTransactions: false,
  });

  /* Grouped Timezones  */
  const allTimezoneOptions = useMemo(() => {
    const all = Array.from(new Set(Object.values(countryTimezones).flat()));
    return toOptions(all);
  }, []);

  const { primary: tzPrimary, other: tzOther } = useMemo(() => {
    const primaryForCountry = countryTimezones[systemSettings.country] ?? [];
    return splitPrimaryOther(allTimezoneOptions, primaryForCountry);
  }, [allTimezoneOptions, systemSettings.country]);

  /* Grouped Languages */
  const languageGroups: GroupBase<LanguageOption>[] = useMemo(() => {
    const prefer = countryLanguages[systemSettings.country] ?? [];
    const { primary, other } = splitPrimaryOther(allLanguageOptions, prefer);
    return [
      { label: `${systemSettings.country} languages`, options: primary },
      { label: 'Other languages', options: other },
    ];
  }, [systemSettings.country]);

  /* Grouped Currency */
  const { primary: currencyPrimary, other: currencyOther } = useMemo(() => {
    const preferred = countryCurrency[systemSettings.country];
    const preferredArr = preferred ? [preferred] : [];
    return splitPrimaryOther(currencyOptions, preferredArr);
  }, [systemSettings.country]);

  /* ----- Derived dial code ----- */
  const dialFromCountry = useMemo(
    () => countryOptions.find(c => c.value === systemSettings.country)?.dial ?? '+60',
    [systemSettings.country]
  );

  useEffect(() => {
    const primaryForCountry = countryTimezones[systemSettings.country] ?? [];
    if (!primaryForCountry.includes(systemSettings.timezone)) { setSystemSettings(prev => ({ ...prev, timezone: primaryForCountry[0] ?? '' })); }
  }, [systemSettings.country, systemSettings.timezone]);

  // Default languages & currency when country changes (but keep editable)
  useEffect(() => {
    const langs = countryLanguages[systemSettings.country] ?? [];
    const curr = countryCurrency[systemSettings.country];

    setSystemSettings(prev => ({ ...prev, languages: langs.length ? langs : prev.languages, currency: curr ?? prev.currency, }));
  }, [systemSettings.country]);

  // Auto-sync dial code with country (but keep editable)
  useEffect(() => {
    if (dialFromCountry !== systemSettings.mobileCountryCode) { setSystemSettings(prev => ({ ...prev, mobileCountryCode: dialFromCountry })); }
  }, [dialFromCountry, systemSettings.mobileCountryCode]);

  /* ----- Save ----- */
  const handleSave = () => {
    alert('Settings saved (demo only)');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country */}
          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              value={systemSettings.country}
              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Countries</SelectLabel>
                  {countryOptions.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Languages */}
          <div>
            <Label>Languages</Label>
            <ReactSelect<LanguageOption, true>
              isMulti
              className="mt-1"
              options={languageGroups}
              value={allLanguageOptions.filter(opt =>
                systemSettings.languages.includes(opt.value)
              )}
              onChange={(selected: MultiValue<LanguageOption>) => setSystemSettings(prev => ({ ...prev, languages: selected.map(s => s.value), }))}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={systemSettings.currency}
              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {currencyPrimary.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{systemSettings.country} currency</SelectLabel>
                    {currencyPrimary.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                  </SelectGroup>
                )}
                <SelectGroup>
                  <SelectLabel>Other currencies</SelectLabel>
                  {currencyOther.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={systemSettings.timezone}
              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectGroup>
                  <SelectLabel>{systemSettings.country} timezones</SelectLabel>
                  {tzPrimary.map(tz => (<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Other timezones</SelectLabel>
                  {tzOther.map(tz => (<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Country Code */}
          <div>
            <Label htmlFor="mobileCountryCode">Mobile Country Code</Label>
            <Select
              value={systemSettings.mobileCountryCode}
              onValueChange={(value) => setSystemSettings(prev => ({ ...prev, mobileCountryCode: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select dial code" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectGroup>
                  <SelectLabel>{systemSettings.country} dial code</SelectLabel>
                  {countryOptions
                    .filter(c => c.value === systemSettings.country).map(c => (<SelectItem key={c.dial} value={c.dial}>{c.dial} ({c.label})</SelectItem>))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Other dial codes</SelectLabel>
                  {countryOptions
                    .filter(c => c.value !== systemSettings.country).map(c => (<SelectItem key={c.dial} value={c.dial}>{c.dial} ({c.label})</SelectItem>))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} className="bg-[#4caf50] hover:bg-[#45a049] text-white">Save System Settings</Button>
        </div>
      </div>
    </div>
  );
}