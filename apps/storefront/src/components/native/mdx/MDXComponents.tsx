import ConsCard from '@/components/native/mdx/ConsCard'
import ProsCard from '@/components/native/mdx/ProsCard'
import Step from '@/components/native/mdx/Step'
import Link from 'next/link'

function MDXImage({ alt, src }) {
   return (
      <div className="my-6 w-full">
         <img
            alt={alt}
            className="mx-auto rounded-lg w-full"
            src={src}
            loading="lazy"
         />
      </div>
   )
}

function Callout(props) {
   return (
      <div className="my-8 flex rounded-lg bg-neutral-200 p-4 dark:bg-neutral-800">
         <div className="mr-4 flex w-4 items-center">{props.emoji}</div>
         <div className="callout w-full">{props.children}</div>
      </div>
   )
}

function Header({ title }) {
   return <>HEY</>
}

const MDXComponents = {
   MDXImage,
   Callout,
   ConsCard,
   ProsCard,
   Step,
   Header,
}

export default MDXComponents
