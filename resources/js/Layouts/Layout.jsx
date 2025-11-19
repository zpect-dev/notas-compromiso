import Logo from "../../../public/Logo.png";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white p-4 shadow-lg">
                <nav className="container mx-auto flex justify-center items-center">
                    <div className="flex items-center space-x-3">
                        <img
                            src={Logo}
                            alt="CristMedical Logo"
                            className="h-14"
                        />
                        <h1 className="text-2xl md:text-3xl font-extrabold text-green-700">
                            CristMedicals
                        </h1>
                    </div>
                </nav>
            </header>

            <main className="grow">{children}</main>
        </div>
    );
}
