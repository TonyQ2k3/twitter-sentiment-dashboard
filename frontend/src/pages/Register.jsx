import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../auth";
import { logo } from "../assets";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [role, setRole] = useState("normal");
  const [companyName, setCompanyName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate enterprise fields if enterprise user type is selected
    if (role === "enterprise") {
      if (!companyName.trim()) {
        setError("Company name is required for enterprise accounts");
        return;
      }
      if (!businessAddress.trim()) {
        setError("Business address is required for enterprise accounts");
        return;
      }
      if (!taxId.trim()) {
        setError("Tax ID/Business registration number is required for enterprise accounts");
        return;
      }
    }
    
    try {
      let userData;
      if (role === "enterprise") {
        userData = { 
          email,
          username, 
          password,
          role,
          company_name: companyName, 
          business_address: businessAddress, 
          tax_id: taxId 
        };
      } 
      else {
        userData = { 
          email, 
          username, 
          password, 
          role 
        };
      }
      
      console.log(userData);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      setToken(data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen py-2 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] dark:shadow-[0_20px_50px_rgba(0,_0,_0,_0.3)] w-96 md:w-[500px] border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:translate-y-[-5px]">
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* Logo Image or Fallback Circle Logo */}
          <img src={logo} alt="" className="w-10 h-10" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Create an account</h1>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">{error}</p>}
        
        {/* User Type Selection */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm font-medium">Choose your account type</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Normal User Option */}
            <label 
              className={`flex flex-col cursor-pointer border rounded-lg p-4 transition-all duration-200 hover:shadow-md
                ${role === "normal" 
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 dark:ring-indigo-400" 
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"}`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="normal"
                  checked={role === "normal"}
                  onChange={() => setRole("normal")}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">Personal Account</span>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-6">
                For individual users. Access to all standard features of Social Scope.
              </div>
            </label>
            
            {/* Enterprise User Option */}
            <label 
              className={`flex flex-col cursor-pointer border rounded-lg p-4 transition-all duration-200 hover:shadow-md
                ${role === "enterprise" 
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500 dark:ring-indigo-400" 
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"}`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="enterprise"
                  checked={role === "enterprise"}
                  onChange={() => setRole("enterprise")}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">Enterprise Account</span>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-6">
                For companies and organizations. Includes advanced business features.
              </div>
            </label>
          </div>
        </div>

        <div className="mb-5">
          <input
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="mb-5">
          <input
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="mb-5">
          <input
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="mb-5">
          <input
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
            type="password"
            placeholder="Confirm password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <p className="text-red-500 text-sm m-2">
            {password !== confirmPass && "Passwords do not match"}
          </p>
        </div>
        
        {/* Enterprise Fields (Conditionally Rendered) */}
        {role === "enterprise" && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Enterprise Information</h2>
            
            <div className="mb-5">
              <input
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="mb-5">
              <textarea
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
                placeholder="Business Address"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                rows="3"
              />
            </div>
            
            <div className="mb-5">
              <input
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all duration-200 text-base"
                placeholder="Tax ID / Business Registration Number"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <button 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          disabled={password !== confirmPass}
        >
          Register
        </button>
        
        <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}