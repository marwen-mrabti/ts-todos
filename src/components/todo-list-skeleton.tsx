export default function TodoListSkeleton() {
  return (
    <div className='space-y-3'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='flex items-start gap-3'>
          <div className='flex-1 space-y-2'>
            <div className='h-8 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700'></div>
          </div>
        </div>
      ))}
    </div>
  );
}
