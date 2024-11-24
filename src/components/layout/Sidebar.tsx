import Link from 'next/link';
import { Users } from 'lucide-react';

// בתוך הניווט
<Link 
  href="/clients" 
  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg"
>
  <Users className="h-5 w-5" />
  <span>לקוחות</span>
</Link> 