import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, User, Briefcase, Building2, Mail, MapPin, Calendar, CreditCard, Building } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface ClientInfoFormProps {
  onNext: (clientInfo: {
    fullName: string;
    idNumber: string;
    birthDate: string;
    email: string;
    address: {
      street: string;
      city: string;
    };
    employment: {
      type: 'employed' | 'self-employed';
      employer?: {
        name: string;
        position: string;
        workplaceAddress: string;
        employmentStartDate: string;
      };
      business?: {
        name: string;
        type: string;
        address: string;
        startDate: string;
      };
    };
  }) => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ onNext }) => {
  const [clientInfo, setClientInfo] = React.useState({
    fullName: '',
    idNumber: '',
    birthDate: '',
    email: '',
    address: {
      street: '',
      city: ''
    },
    employment: {
      type: 'employed' as 'employed' | 'self-employed',
      employer: {
        name: '',
        position: '',
        workplaceAddress: '',
        employmentStartDate: ''
      },
      business: {
        name: '',
        type: '',
        address: '',
        startDate: ''
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(clientInfo);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="w-16 h-16 text-[#4361ee]" />
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-l from-blue-600 to-purple-600 bg-clip-text text-transparent">
            מסע לקוח חכם
          </h1>
          <p className="text-gray-500 mt-2">הזנת פרטי לקוח</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <h2 className="text-xl font-semibold">פרטים אישיים</h2>
              </div>
              <p className="text-sm opacity-90">מידע בסיסי על הלקוח</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="שם מלא"
                  value={clientInfo.fullName}
                  onChange={(e) => setClientInfo({ ...clientInfo, fullName: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                  required
                />
                <User className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="מספר זהות"
                  value={clientInfo.idNumber}
                  onChange={(e) => setClientInfo({ ...clientInfo, idNumber: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                  required
                />
                <CreditCard className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  type="date"
                  value={clientInfo.birthDate}
                  onChange={(e) => setClientInfo({ ...clientInfo, birthDate: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                  required
                />
                <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  type="email"
                  placeholder="כתובת אימייל"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                  required
                />
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="רחוב"
                    value={clientInfo.address.street}
                    onChange={(e) => setClientInfo({
                      ...clientInfo,
                      address: { ...clientInfo.address, street: e.target.value }
                    })}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                    required
                  />
                  <MapPin className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="עיר"
                    value={clientInfo.address.city}
                    onChange={(e) => setClientInfo({
                      ...clientInfo,
                      address: { ...clientInfo.address, city: e.target.value }
                    })}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                    required
                  />
                  <Building className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <h2 className="text-xl font-semibold">פרטי תעסוקה</h2>
              </div>
              <p className="text-sm opacity-90">מידע על תעסוקת הלקוח</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <RadioGroup
                    value={clientInfo.employment.type}
                    onValueChange={(value: 'employed' | 'self-employed') => 
                      setClientInfo({
                        ...clientInfo,
                        employment: { ...clientInfo.employment, type: value }
                      })
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 flex-row-reverse">
                      <Label htmlFor="employed">שכיר</Label>
                      <RadioGroupItem value="employed" id="employed" />
                    </div>
                    <div className="flex items-center space-x-2 flex-row-reverse">
                      <Label htmlFor="self-employed">עצמאי</Label>
                      <RadioGroupItem value="self-employed" id="self-employed" />
                    </div>
                  </RadioGroup>
                </div>

                {clientInfo.employment.type === 'employed' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="שם המעסיק"
                        value={clientInfo.employment.employer?.name}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            employer: {
                              ...clientInfo.employment.employer!,
                              name: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <Building2 className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="תפקיד"
                        value={clientInfo.employment.employer?.position}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            employer: {
                              ...clientInfo.employment.employer!,
                              position: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <Briefcase className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="כתובת מקום העבודה"
                        value={clientInfo.employment.employer?.workplaceAddress}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            employer: {
                              ...clientInfo.employment.employer!,
                              workplaceAddress: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <MapPin className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <Input
                        type="date"
                        placeholder="תאריך תחילת עבודה"
                        value={clientInfo.employment.employer?.employmentStartDate}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            employer: {
                              ...clientInfo.employment.employer!,
                              employmentStartDate: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="שם העסק"
                        value={clientInfo.employment.business?.name}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            business: {
                              ...clientInfo.employment.business!,
                              name: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <Building2 className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="סוג העסק"
                        value={clientInfo.employment.business?.type}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            business: {
                              ...clientInfo.employment.business!,
                              type: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <Briefcase className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="כתובת העסק"
                        value={clientInfo.employment.business?.address}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            business: {
                              ...clientInfo.employment.business!,
                              address: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <MapPin className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative">
                      <Input
                        type="date"
                        placeholder="תאריך תחילת פעילות"
                        value={clientInfo.employment.business?.startDate}
                        onChange={(e) => setClientInfo({
                          ...clientInfo,
                          employment: {
                            ...clientInfo.employment,
                            business: {
                              ...clientInfo.employment.business!,
                              startDate: e.target.value
                            }
                          }
                        })}
                        className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg text-right"
                        required
                      />
                      <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-8 rounded-lg transition-all text-lg shadow-lg hover:shadow-xl"
          >
            המשך למסע
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientInfoForm; 