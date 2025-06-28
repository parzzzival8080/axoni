import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import defaultProfileImage from "../assets/assets/default.png";

const SignUpPage = () => {
  const navigate = useNavigate();

  // State for form steps
  const [currentStep, setCurrentStep] = useState(1);

  // State for form values
  const [formData, setFormData] = useState({
    country: "",
    termsAccepted: false,
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    profilePic: defaultProfileImage,
    otp: ["", "", "", "", "", ""],
  });

  // State for error and loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Country-related state
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [countrySearchTerm, setCountrySearchTerm] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Refs for file input and OTP inputs
  const fileInputRef = useRef(null);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // Initialize OTP refs safely
  useEffect(() => {
    otpRefs.current = Array(6)
      .fill(null)
      .map((_, i) => otpRefs.current[i] || React.createRef());
  }, []);

  // Fetch countries from REST Countries API
  const fetchCountries = useCallback(async () => {
    try {
      setLoadingCountries(true);

      const response = await axios.get(
        "https://restcountries.com/v3.1/all?fields=name,flags,idd",
        {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        },
      );

      if (response.data && Array.isArray(response.data)) {
        // Sort countries alphabetically by common name
        const sortedCountries = response.data
          .filter((country) => country.name?.common) // Filter out countries without names
          .sort((a, b) => a.name.common.localeCompare(b.name.common));

        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
        console.log(
          `Loaded ${sortedCountries.length} countries from REST Countries API`,
        );
      } else {
        throw new Error("Invalid response format from countries API");
      }
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      setError("Failed to load countries. Please try again.");

      // Fallback to a minimal country list if API fails
      const fallbackCountries = [
        {
          name: {
            common: "United States",
            official: "United States of America",
          },
          flags: {
            png: "https://flagcdn.com/w320/us.png",
            svg: "https://flagcdn.com/us.svg",
          },
        },
        {
          name: {
            common: "United Kingdom",
            official: "United Kingdom of Great Britain and Northern Ireland",
          },
          flags: {
            png: "https://flagcdn.com/w320/gb.png",
            svg: "https://flagcdn.com/gb.svg",
          },
        },
        {
          name: { common: "Canada", official: "Canada" },
          flags: {
            png: "https://flagcdn.com/w320/ca.png",
            svg: "https://flagcdn.com/ca.svg",
          },
        },
        {
          name: {
            common: "Philippines",
            official: "Republic of the Philippines",
          },
          flags: {
            png: "https://flagcdn.com/w320/ph.png",
            svg: "https://flagcdn.com/ph.svg",
          },
        },
      ];
      setCountries(fallbackCountries);
      setFilteredCountries(fallbackCountries);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // Load countries on component mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Handle country search with debouncing
  const handleCountrySearch = useCallback(
    (searchTerm) => {
      setCountrySearchTerm(searchTerm);

      if (!searchTerm.trim()) {
        setFilteredCountries(countries);
        return;
      }

      const filtered = countries.filter((country) => {
        const commonName = country.name.common.toLowerCase();
        const officialName = country.name.official?.toLowerCase() || "";
        const search = searchTerm.toLowerCase().trim();

        return (
          commonName.includes(search) ||
          officialName.includes(search) ||
          commonName.startsWith(search) ||
          officialName.startsWith(search)
        );
      });

      setFilteredCountries(filtered);
    },
    [countries],
  );

  // Handle country selection
  const handleCountrySelect = useCallback(
    (selectedCountry) => {
      setFormData((prev) => ({
        ...prev,
        country: selectedCountry.name.common,
      }));
      setCountrySearchTerm(selectedCountry.name.common);
      setShowCountryDropdown(false);

      // Clear any existing errors
      if (error) {
        setError("");
      }
    },
    [error],
  );

  // Timer for OTP resend with proper cleanup
  useEffect(() => {
    if (currentStep === 3 && resendTimer > 0 && !canResend) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStep, resendTimer, canResend]);

  // Email validation helper
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Password validation helper
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Phone validation helper
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone.trim());
  };

  // Handle input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      let processedValue = value;

      // Only allow numbers for phone field
      if (name === "phone") {
        processedValue = value.replace(/\D/g, ""); // Remove all non-digit characters
      }

      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : processedValue,
      }));

      // Clear error when user starts typing
      if (error) {
        setError("");
      }
    },
    [error],
  );

  // Handle OTP input changes with improved validation
  const handleOtpChange = useCallback(
    (index, value) => {
      // Only allow single digits
      if (value && (!/^\d$/.test(value) || value.length > 1)) return;

      const newOtp = [...formData.otp];
      newOtp[index] = value;

      setFormData((prev) => ({
        ...prev,
        otp: newOtp,
      }));

      // Auto-focus next input
      if (value && index < 5 && otpRefs.current[index + 1]) {
        otpRefs.current[index + 1].focus();
      }

      // Clear error when user starts entering OTP
      if (error) {
        setError("");
      }
    },
    [formData.otp, error],
  );

  // Handle key press in OTP fields
  const handleOtpKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace") {
        if (!formData.otp[index] && index > 0 && otpRefs.current[index - 1]) {
          // Move to previous field if current is empty
          otpRefs.current[index - 1].focus();
        } else if (formData.otp[index]) {
          // Clear current field
          const newOtp = [...formData.otp];
          newOtp[index] = "";
          setFormData((prev) => ({
            ...prev,
            otp: newOtp,
          }));
        }
      }
    },
    [formData.otp],
  );

  // Handle paste for OTP with improved validation
  const handleOtpPaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");

      if (!pasteData) return;

      const digits = pasteData.slice(0, 6).split("");
      const newOtp = [...formData.otp];

      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });

      // Fill remaining with empty strings
      for (let i = digits.length; i < 6; i++) {
        newOtp[i] = "";
      }

      setFormData((prev) => ({
        ...prev,
        otp: newOtp,
      }));

      // Focus appropriate field
      const nextEmptyIndex = newOtp.findIndex((val) => !val);
      const focusIndex =
        nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(digits.length, 5);

      if (otpRefs.current[focusIndex]) {
        otpRefs.current[focusIndex].focus();
      }
    },
    [formData.otp],
  );

  // Handle profile picture upload with improved validation
  const handleProfileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        profilePic: event.target.result,
      }));
    };
    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  }, []);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // API call helper with better error handling
  const makeApiCall = async (url, payload, options = {}) => {
    try {
      const config = {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      const response = await axios.post(url, payload, config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`API Error for ${url}:`, error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.response) {
        const { data, status } = error.response;

        // Handle specific error cases based on Django API responses
        if (status === 400) {
          if (data?.error === "Email already in use") {
            errorMessage =
              "This email is already registered. Please use a different email or login.";
          } else if (data?.error === "Passwords do not match!") {
            errorMessage =
              "Passwords do not match. Please check your password confirmation.";
          } else if (data?.error === "Invalid email format") {
            errorMessage = "Please enter a valid email address.";
          } else if (data?.error) {
            errorMessage = data.error;
          } else if (data?.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "Invalid credentials or session expired.";
        } else if (status === 403) {
          errorMessage = "Access denied. Please try again.";
        } else if (status === 404) {
          errorMessage = "Service not found. Please try again later.";
        } else if (status === 429) {
          errorMessage =
            "Too many requests. Please wait a moment and try again.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      }

      return { success: false, error: errorMessage };
    }
  };

  // Step navigation functions with improved validation
  const goToNextStep = async (step) => {
    setError("");

    if (step === 1) {
      // Validate step 1
      if (!formData.country.trim()) {
        setError("Please select a country");
        return;
      }
      if (!formData.termsAccepted) {
        setError("Please agree to the terms and conditions");
        return;
      }
      setCurrentStep(2);
    } else if (step === 2) {
      // Validate step 2
      if (!formData.email.trim()) {
        setError("Please enter your email address");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!formData.password) {
        setError("Please enter a password");
        return;
      }
      if (!validatePassword(formData.password)) {
        setError("Password must be at least 8 characters long");
        return;
      }
      if (!formData.confirmPassword) {
        setError("Please confirm your password");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        setLoading(true);

        // Updated payload to match Django API expected fields
        const payload = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirm_password: formData.confirmPassword,
        };

        console.log("Attempting registration with payload:", {
          email: payload.email,
          password: "[HIDDEN]",
        });

        const result = await makeApiCall(
          "https://django.kinecoin.cokinecoin.co/api/user_account/signup",
          payload,
        );

        if (!result.success) {
          setError(result.error);
          return;
        }

        const data = result.data;
        console.log("Registration successful:", {
          ...data,
          password: "[HIDDEN]",
        });

        // Validate response data - Django returns user_id in response
        if (!data.user_id) {
          setError("Registration failed: Invalid server response");
          return;
        }

        setUserId(data.user_id);

        // Store initial data
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("tempEmail", formData.email.trim().toLowerCase());

        setCurrentStep(3);
        setResendTimer(60);
        setCanResend(false);

        // Focus first OTP input
        setTimeout(() => {
          if (otpRefs.current[0]) {
            otpRefs.current[0].focus();
          }
        }, 100);
      } catch (err) {
        console.error("Unexpected registration error:", err);
        setError("Registration failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Validate OTP
      const otpValue = formData.otp.join("");
      if (otpValue.length !== 6) {
        setError("Please enter the complete 6-digit verification code");
        return;
      }
      if (!/^\d{6}$/.test(otpValue)) {
        setError("Verification code must contain only numbers");
        return;
      }

      try {
        setLoading(true);

        const payload = {
          email: formData.email.trim().toLowerCase(),
          otp: otpValue,
        };

        console.log("Verifying OTP for email:", payload.email);

        const result = await makeApiCall(
          "https://django.kinecoin.cokinecoin.co/api/user_account/verify-otp",
          payload,
        );

        if (result.success) {
          console.log("OTP verification successful");

          // Store verification data - Django returns jwt_token, uid, etc.
          const verificationData = result.data;
          if (verificationData.jwt_token) {
            localStorage.setItem("authToken", verificationData.jwt_token);
            localStorage.setItem("jwt_token", verificationData.jwt_token);
          }
          if (verificationData.uid) {
            localStorage.setItem("uid", verificationData.uid);
          }
          if (verificationData.referral_code) {
            localStorage.setItem(
              "referral_code",
              verificationData.referral_code,
            );
          }
          if (verificationData.secret_phrase) {
            localStorage.setItem(
              "secret_phrase",
              verificationData.secret_phrase,
            );
          }

          setCurrentStep(4);
        } else {
          setError(
            result.error || "Invalid verification code. Please try again.",
          );
        }
      } catch (err) {
        console.error("OTP verification error:", err);
        setError("Verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Resend OTP function with improved error handling
  const handleResendOtp = async () => {
    if (!canResend && resendTimer > 0) return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        email: formData.email.trim().toLowerCase(),
      };

      console.log("Resending OTP to:", payload.email);

      const result = await makeApiCall(
        "https://django.kinecoin.cokinecoin.co/api/user_account/resend-otp",
        payload,
      );

      if (result.success) {
        console.log("OTP resent successfully");
        setResendTimer(60);
        setCanResend(false);
        // Clear OTP inputs
        setFormData((prev) => ({
          ...prev,
          otp: ["", "", "", "", "", ""],
        }));
        // Focus first OTP input
        setTimeout(() => {
          if (otpRefs.current[0]) {
            otpRefs.current[0].focus();
          }
        }, 100);
      } else {
        setError(result.error || "Failed to resend verification code");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (final step) with comprehensive error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate final step
    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters long");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);

      const storedUserId = userId || localStorage.getItem("user_id");
      const storedToken =
        localStorage.getItem("authToken") || localStorage.getItem("jwt_token");

      if (!storedUserId) {
        setError("Session expired. Please try signing up again.");
        setCurrentStep(1);
        return;
      }

      // Prepare profile data according to Django API expectations
      const profileData = {
        name: formData.fullName.trim(),
        phone_number: formData.phone.trim(),
        // Add any additional fields that need to be updated
      };

      let profileDataPayload;
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${storedToken}`,
      };

      // Handle profile picture upload
      if (
        formData.profilePic &&
        formData.profilePic.startsWith("data:image") &&
        formData.profilePic !== defaultProfileImage
      ) {
        // Use FormData for file uploads
        profileDataPayload = new FormData();

        // Append all profile data to FormData
        Object.entries(profileData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            profileDataPayload.append(key, value);
          }
        });

        try {
          const response = await fetch(formData.profilePic);
          const blob = await response.blob();
          const profileImageFile = new File([blob], "profile.jpg", {
            type: blob.type || "image/jpeg",
          });
          profileDataPayload.append("user_profile", profileImageFile);
          // Let the browser set the Content-Type with boundary for FormData
          delete headers["Content-Type"];
        } catch (imageError) {
          console.warn(
            "Failed to process profile image, continuing without it:",
            imageError,
          );
          // Fall back to JSON if image processing fails
          profileDataPayload = profileData;
          headers["Content-Type"] = "application/json";
        }
      } else {
        // Use regular JSON for non-file updates
        profileDataPayload = profileData;
        headers["Content-Type"] = "application/json";
      }

      const profileUpdateUrl = `https://django.kinecoin.cokinecoin.co/api/user_account/edit_profile/user=${storedUserId}`;

      console.log("Updating profile for user:", storedUserId);
      console.log("Profile data being sent:", profileDataPayload);

      try {
        // Make profile update request with minimal headers
        const response = await axios.post(
          profileUpdateUrl,
          profileDataPayload,
          {
            headers: headers,
            timeout: 30000,
            withCredentials: true,
          },
        );

        console.log("Profile update response:", response.data);

        if (!response.data.success) {
          const errorMsg =
            response.data.message ||
            "Failed to update profile. Please try again.";
          setError(errorMsg);
          console.error("Profile update failed:", response.data);
          return;
        }

        // If we have a profile image in the response, update it
        if (response.data.user_detail?.user_profile) {
          localStorage.setItem(
            "profileImage",
            response.data.user_detail.user_profile,
          );
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        setError(
          error.response?.data?.message ||
            "Failed to update profile. Please try again.",
        );
        return;
      }

      // Get updated user data after profile update
      try {
        const userInfoResponse = await axios.get(
          `https://django.kinecoin.cokinecoin.co/api/user_account/getUserInformation/?user_id=${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            timeout: 10000,
          },
        );

        const userData = userInfoResponse.data;

        // Store essential user data in localStorage
        const essentialData = {
          fullName: formData.fullName || userData.user?.name || "",
          email: formData.email || userData.user?.email || "",
          user_id: storedUserId,
          isAuthenticated: "true",
          phone: userData.user_detail?.phone_number || formData.phone || "",
          userName: userData.user?.name || formData.fullName || "",
          userEmail: userData.user?.email || formData.email || "",
          is_verified: userData.user_detail?.is_verified?.toString() || "false",
          profileImage:
            userData.user_detail?.user_profile ||
            formData.profilePic ||
            defaultProfileImage,
        };

        // Save to localStorage
        Object.entries(essentialData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, value);
          }
        });

        console.log("User data saved to localStorage:", essentialData);
      } catch (userInfoError) {
        console.error("Failed to fetch updated user info:", userInfoError);
        // Fallback to form data if API call fails
        const fallbackData = {
          fullName: formData.fullName,
          email: formData.email,
          user_id: storedUserId,
          isAuthenticated: "true",
          phone: formData.phone,
          userName: formData.fullName,
          userEmail: formData.email,
          is_verified: "false",
          profileImage: formData.profilePic,
        };

        Object.entries(fallbackData).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value);
        });
      }

      // Update country information
      if (formData.country) {
        try {
          const countryPayload = {
            user_id: parseInt(storedUserId),
            country: formData.country,
          };

          const countryResult = await makeApiCall(
            "https://django.kinecoin.cokinecoin.co/api/user_account/user-detail/add-country",
            countryPayload,
            { headers: { Authorization: `Bearer ${storedToken}` } },
          );

          if (countryResult.success) {
            localStorage.setItem("userCountry", formData.country);
            console.log("Country updated successfully");

            // Send additional user data
            try {
              const sendDataResult = await makeApiCall(
                "https://django.kinecoin.cokinecoin.co/api/user_account/send-data",
                {
                  user_id: parseInt(storedUserId),
                  password: formData.password,
                },
                { headers: { Authorization: `Bearer ${storedToken}` } },
              );

              if (sendDataResult.success) {
                console.log("User data sent successfully");
              } else {
                console.warn("Failed to send user data:", sendDataResult.error);
              }
            } catch (sendDataError) {
              console.warn(
                "Non-critical error sending user data:",
                sendDataError,
              );
              // Continue with registration even if send-data fails
            }
          } else {
            console.warn("Failed to update country:", countryResult.error);
          }
        } catch (countryError) {
          console.warn("Non-critical error updating country:", countryError);
          // Continue with registration even if country update fails
        }
      }

      // Get user information including verification status
      try {
        const userInfoResponse = await axios.get(
          `https://django.kinecoin.cokinecoin.co/api/user_account/getUserInformation/?user_id=${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            timeout: 15000,
          },
        );

        if (userInfoResponse.data) {
          const userInfo = userInfoResponse.data;

          // Store user information
          if (userInfo.user) {
            localStorage.setItem("user", JSON.stringify(userInfo.user));
            if (userInfo.user.uid) {
              localStorage.setItem("uid", userInfo.user.uid);
            }
            if (userInfo.user.referral_code) {
              localStorage.setItem(
                "referral_code",
                userInfo.user.referral_code,
              );
            }
            if (userInfo.user.secret_phrase) {
              localStorage.setItem(
                "secret_phrase",
                userInfo.user.secret_phrase,
              );
            }
          }

          if (userInfo.user_detail) {
            const isVerified = userInfo.user_detail.is_verified || false;
            localStorage.setItem("is_verified", isVerified.toString());
            console.log("Verification status stored:", isVerified);
          }
        }
      } catch (userInfoErr) {
        console.warn("Failed to fetch user information:", userInfoErr);
        localStorage.setItem("is_verified", "false");
      }

      // Success - redirect user
      console.log("Registration completed successfully");

      // Show success message
      setTimeout(() => {
        alert("Registration successful! Welcome to KINE.");

        const isVerified = localStorage.getItem("is_verified") === "true";
        navigate(isVerified ? "/spot-trading" : "/", { replace: true });
      }, 500);
    } catch (err) {
      console.error("Profile update error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to complete registration. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section (Dark) */}
        <div className="hidden md:flex md:w-2/5 bg-black p-0 justify-center items-center overflow-y-auto">
          <img
            src="/assets/login/signup.png"
            alt="Sign up illustration"
            className="mx-auto max-h-[65vh] max-w-[340px] w-auto object-contain"
            draggable="false"
            onError={(e) => {
              console.warn("Signup image failed to load");
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Right Section (White) */}
        <div className="w-full md:w-3/5 bg-white text-black p-8 md:p-12 lg:p-16 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-medium mb-9">Let's get you started</h2>

            {/* Progress Bar */}
            <div className="relative mb-9">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2"></div>
              <div className="flex justify-between relative z-0">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                                     ${
                                       currentStep >= step
                                         ? "bg-[#F88726] text-white border-[#F88726]"
                                         : "bg-white text-gray-400 border border-gray-300"
                                     }`}
                    >
                      {step}
                    </div>
                    <span
                      className={`text-xs mt-2 whitespace-nowrap transition-colors duration-200 ${
                        currentStep >= step
                          ? "text-black font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {step === 1
                        ? "Country"
                        : step === 2
                          ? "Credentials"
                          : step === 3
                            ? "Verification"
                            : "Profile"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-start">
                <i className="fas fa-exclamation-circle text-red-500 mr-2 mt-0.5 flex-shrink-0"></i>
                <span className="text-red-700 text-sm leading-relaxed">
                  {error}
                </span>
              </div>
            )}

            {/* Step 1: Country Selection */}
            <div className={currentStep !== 1 ? "hidden" : ""}>
              <h3 className="text-gray-700 text-base mb-6 leading-relaxed">
                Select the country/region that exactly matches the one on your
                ID or proof of address.
              </h3>
              <div className="mb-6 relative">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Country/region *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="country"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                    placeholder={
                      loadingCountries
                        ? "Loading countries..."
                        : "Search for a country..."
                    }
                    value={countrySearchTerm}
                    onChange={(e) => handleCountrySearch(e.target.value)}
                    onFocus={() => setShowCountryDropdown(true)}
                    disabled={loadingCountries}
                    autoComplete="country"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {loadingCountries ? (
                      <i className="fas fa-spinner fa-spin text-gray-400"></i>
                    ) : (
                      <i className="fas fa-chevron-down text-gray-400"></i>
                    )}
                  </div>

                  {/* Country Dropdown */}
                  {showCountryDropdown && !loadingCountries && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country, index) => (
                          <div
                            key={`${country.name.common}-${index}`}
                            className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            onClick={() => handleCountrySelect(country)}
                          >
                            {country.flags && country.flags.png && (
                              <img
                                src={country.flags.png}
                                alt={
                                  country.flags.alt ||
                                  `${country.name.common} flag`
                                }
                                className="w-6 h-4 mr-3 object-cover rounded-sm flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {country.name.common}
                              </div>
                              {country.name.official &&
                                country.name.official !==
                                  country.name.common && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {country.name.official}
                                  </div>
                                )}
                            </div>
                          </div>
                        ))
                      ) : countrySearchTerm.trim() ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No countries found matching "{countrySearchTerm}"
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Start typing to search for countries
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Click outside to close dropdown */}
                {showCountryDropdown && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCountryDropdown(false)}
                  />
                )}
              </div>

              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="flex-shrink-0 mr-3 mt-1"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  By creating an account, I agree to KINE{" "}
                  <a
                    href="#"
                    className="text-[#F88726] hover:underline font-medium"
                  >
                    Terms of Service
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    className="text-[#F88726] hover:underline font-medium"
                  >
                    Risk and Compliance Disclosure
                  </a>
                  , and{" "}
                  <a
                    href="#"
                    className="text-[#F88726] hover:underline font-medium"
                  >
                    Privacy Notice
                  </a>
                  .
                </label>
              </div>

              <button
                className="w-full py-3.5 px-6 rounded-full bg-[#F88726] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(1)}
                disabled={
                  loading ||
                  !formData.country ||
                  !formData.termsAccepted ||
                  loadingCountries
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </span>
                ) : (
                  "Next"
                )}
              </button>

              <div className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#F88726] font-medium hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>

            {/* Step 2: Email and Password */}
            <div className={currentStep !== 2 ? "hidden" : ""}>
              <h3 className="text-gray-700 text-base mb-6">
                Tell us your email
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Email address *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Password *
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                  id="password"
                  name="password"
                  placeholder="Create a password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Confirm password *
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                className="w-full py-3.5 px-6 rounded-full bg-[#F88726] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(2)}
                disabled={
                  loading ||
                  !formData.email ||
                  !formData.password ||
                  !formData.confirmPassword
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

            {/* Step 3: OTP Verification */}
            <div className={currentStep !== 3 ? "hidden" : ""}>
              <h3 className="text-gray-700 text-base mb-2">Verify it's you</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Look out for the code we've sent to {formData.email}
              </p>
              <div className="flex justify-between gap-2 mb-6">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-12 h-14 text-center text-lg border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    ref={(el) => {
                      if (otpRefs.current) otpRefs.current[index] = el;
                    }}
                    autoFocus={index === 0 && currentStep === 3}
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                ))}
              </div>
              <div className="text-center mb-6">
                <button
                  className={`text-sm font-medium transition-colors ${
                    canResend
                      ? "text-[#F88726] hover:underline cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                      Sending...
                    </span>
                  ) : (
                    `Resend${resendTimer > 0 ? ` (${resendTimer}s)` : ""}`
                  )}
                </button>
              </div>
              <button
                className="w-full py-3.5 px-6 rounded-full bg-[#F88726] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(3)}
                disabled={loading || formData.otp.join("").length !== 6}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Verifying...
                  </span>
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            {/* Step 4: Profile Details */}
            <div className={currentStep !== 4 ? "hidden" : ""}>
              <h3 className="text-gray-700 text-base mb-6">
                Complete your profile
              </h3>
              <div
                className="w-28 h-28 rounded-full bg-gray-100 mx-auto mb-5 relative cursor-pointer overflow-hidden group hover:bg-gray-200 transition-colors duration-200"
                onClick={triggerFileInput}
              >
                <img
                  id="profile-preview"
                  src={formData.profilePic}
                  alt="Profile Preview"
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProfileImage;
                  }}
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#F88726] rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1 group-hover:scale-110 transition-transform duration-200">
                  <i className="fas fa-camera text-white text-sm"></i>
                </div>
                <input
                  type="file"
                  id="profile-pic-upload"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleProfileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-center text-gray-500 text-sm mb-6">
                Click to upload a profile picture (optional)
              </p>

              <div className="mb-6">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="mb-8">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Phone Number *
                </label>
                <div className="flex">
                  <select
                    className="w-24 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent text-sm"
                    defaultValue="+1"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+86">+86 (CN)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+63">+63 (PH)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+82">+82 (KR)</option>
                  </select>
                  <input
                    type="tel"
                    className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#F88726] focus:border-transparent transition-all duration-200"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>

              <button
                className="w-full py-3.5 px-6 rounded-full bg-[#F88726] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading || !formData.fullName || !formData.phone}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Completing Registration...
                  </span>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="chat-bubble">
        <i className="fas fa-comment-dots"></i>
      </div>
    </div>
  );
};

export default SignUpPage;
