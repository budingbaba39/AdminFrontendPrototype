import { useState } from 'react';
import svgPaths from "./svg-305fothfoh";

function PaginationBar() {
  return (
    <div className="h-[76px] relative shrink-0 w-full" data-name="Pagination Bar">
      <div aria-hidden="true" className="absolute border border-[#e0e0e0] border-solid inset-0 pointer-events-none shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[76px] items-center justify-between px-[41px] py-[13px] relative w-full">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-4 h-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 14 14">
                <path clipRule="evenodd" d={svgPaths.p13f23570} fill="var(--fill-0, #171212)" fillRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-lg text-[#171212]">DemoGame88</span>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-[#f5f0f0] rounded-lg p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 18 18">
                <path clipRule="evenodd" d={svgPaths.p4458600} fill="var(--fill-0, #171212)" fillRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage({ onLogin }: { onLogin?: (username: string, phoneNumber: string) => boolean }) {
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: ''
  });

  const [isRecaptchaChecked, setIsRecaptchaChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.username && formData.phoneNumber && isRecaptchaChecked) {
      const success = onLogin?.(formData.username, formData.phoneNumber);
      if (!success) {
        setErrorMessage('Invalid username or phone number');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full min-h-screen" data-name="Admin Login Page">
      <div className="bg-white min-h-[800px] relative shrink-0 w-full" data-name="Depth 0, Frame 0">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start min-h-inherit overflow-clip p-px relative w-full">
          <PaginationBar />
          <div className="h-auto min-h-[735px] relative shrink-0 w-full" data-name="Depth 2, Frame 1">
            <div className="flex flex-row justify-center relative size-full">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex min-h-[735px] items-start justify-center px-4 md:px-[160px] py-[20px] relative w-full">
                <div className="min-h-[695px] max-w-[960px] relative shrink-0 w-full md:w-[960px]" data-name="Depth 3, Frame 0">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col min-h-[695px] items-center max-w-inherit overflow-clip px-0 py-[20px] relative w-full">
                    
                    {/* Welcome Title */}
                    <div className="h-[58px] relative shrink-0 w-full max-w-[237px] mb-4" data-name="Depth 4, Frame 0">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[58px] items-center pb-[12px] pt-[20px] px-[16px] relative w-full">
                        <div className="css-l1793z font-['Spline_Sans:Bold',_sans-serif] font-bold leading-[0] relative shrink-0 text-[#171212] text-2xl md:text-[28px] text-center w-full">
                          <p className="leading-[35px]">Welcome back</p>
                        </div>
                      </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                      {/* Username Field */}
                      <div className="max-w-[480px] relative shrink-0 w-full" data-name="Depth 4, Frame 1">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-end flex flex-wrap gap-[16px] items-end max-w-inherit px-[16px] py-[12px] relative">
                          <div className="basis-0 grow min-h-px min-w-[160px] relative shrink-0" data-name="Depth 5, Frame 0">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start min-w-inherit relative w-full">
                              <div className="bg-white h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="Depth 6, Frame 0">
                                <div className="flex flex-row items-center overflow-clip relative size-full">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[56px] items-center p-[16px] relative w-full">
                                    <input
                                      type="text"
                                      placeholder="Username"
                                      value={formData.username}
                                      onChange={(e) => handleInputChange('username', e.target.value)}
                                      className="w-full bg-transparent outline-none font-['Spline_Sans:Regular',_sans-serif] font-normal text-[#8c5e5e] text-[16px] placeholder:text-[#8c5e5e]"
                                      required
                                    />
                                  </div>
                                </div>
                                <div aria-hidden="true" className="absolute border border-[#e5dbdb] border-solid inset-0 pointer-events-none rounded-[8px]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phone Number Field */}
                      <div className="max-w-[480px] relative shrink-0 w-full" data-name="Depth 4, Frame 2">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-end flex flex-wrap gap-[16px] items-end max-w-inherit px-[16px] py-[12px] relative">
                          <div className="basis-0 grow min-h-px min-w-[160px] relative shrink-0" data-name="Depth 5, Frame 0">
                            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start min-w-inherit relative w-full">
                              <div className="bg-white h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="Depth 6, Frame 0">
                                <div className="flex flex-row items-center overflow-clip relative size-full">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[56px] items-center p-[16px] relative w-full">
                                    <input
                                      type="tel"
                                      placeholder="Phone Number"
                                      value={formData.phoneNumber}
                                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                      className="w-full bg-transparent outline-none font-['Spline_Sans:Regular',_sans-serif] font-normal text-[#8c5e5e] text-[16px] placeholder:text-[#8c5e5e]"
                                      required
                                    />
                                  </div>
                                </div>
                                <div aria-hidden="true" className="absolute border border-[#e5dbdb] border-solid inset-0 pointer-events-none rounded-[8px]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Demo reCAPTCHA */}
                      <div className="w-full max-w-md">
                        <div className="bg-[#f9f9f9] border border-[#d3d3d3] rounded p-3 flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => setIsRecaptchaChecked(!isRecaptchaChecked)}
                            className="w-5 h-5 border-2 border-[#4285f4] rounded bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            {isRecaptchaChecked ? (
                              <svg className="w-3 h-3 text-[#4285f4]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            ) : (
                              <div className="w-2 h-2 bg-[#4285f4]"></div>
                            )}
                          </button>
                          <span className="text-sm">I'm not a robot</span>
                          <span className="text-xs text-gray-500 ml-auto">reCAPTCHA</span>
                        </div>
                      </div>

                      {/* Error Message */}
                      {errorMessage && (
                        <div className="w-full max-w-md">
                          <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
                            <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                          </div>
                        </div>
                      )}

                      {/* Login Button */}
                      <div className="relative shrink-0 w-full" data-name="Depth 4, Frame 4">
                        <div className="flex flex-row justify-center relative size-full">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start justify-center px-[16px] py-[12px] relative w-full">
                            <button
                              type="submit"
                              disabled={!isRecaptchaChecked}
                              className="basis-0 bg-[#fa0505] hover:bg-[#e50404] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors grow h-[40px] max-w-[480px] min-h-px min-w-[84px] relative rounded-[8px] shrink-0 flex items-center justify-center"
                              data-name="Depth 5, Frame 0"
                            >
                              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[40px] items-center justify-center max-w-inherit min-w-inherit px-[16px] py-0 relative w-full">
                                <div className="css-7se0s3 font-['Spline_Sans:Bold',_sans-serif] font-bold leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[14px] text-center text-nowrap text-white w-full">
                                  <p className="leading-[21px] overflow-ellipsis overflow-hidden whitespace-pre">Log In</p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
      </div>
    </div>
  );
}