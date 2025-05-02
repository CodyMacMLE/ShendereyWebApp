export default function StatusTag({active} : {active: boolean}) {
    return active ? (
        <span className="inline-flex items-center rounded-md bg-green-50/5 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600">
            Active
        </span>
    ) : (
        <span className="inline-flex items-center rounded-md bg-red-50/5 px-2 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-600">
            Inactive
        </span>
    )
}