export default function StatusTag({active, onClick} : {active: boolean, onClick?: () => void}) {
    const baseClasses = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset";
    const activeClasses = "bg-green-50/5 text-green-600 ring-green-600";
    const inactiveClasses = "bg-red-50/5 text-red-600 ring-red-600";
    const clickableClasses = onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : "";
    
    return active ? (
        <span 
            className={`${baseClasses} ${activeClasses} ${clickableClasses}`}
            onClick={onClick}
        >
            Active
        </span>
    ) : (
        <span 
            className={`${baseClasses} ${inactiveClasses} ${clickableClasses}`}
            onClick={onClick}
        >
            Inactive
        </span>
    )
}