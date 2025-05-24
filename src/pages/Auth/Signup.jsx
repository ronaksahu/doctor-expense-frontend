export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center text-blue-600">Doctor Sign Up</h2>

        <form className="space-y-4">
          <input type="text" placeholder="Name" className="input" />
          <input type="email" placeholder="Email" className="input" />
          <input type="password" placeholder="Password" className="input" />
          <input type="text" placeholder="Degree" className="input" />
          <input type="text" placeholder="Mobile Number" className="input" />
          <input type="text" placeholder="Speciality" className="input" />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Create New Account
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already Registered?{" "}
          <button className="text-blue-600 hover:underline">Log in here.</button>
        </p>
      </div>
    </div>
  );
}

  