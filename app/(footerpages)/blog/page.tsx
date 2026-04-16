import BlogPost from './blogPost'
export interface BlogPostType {
  id: number
  title: string
  content: string
  image: string
  date: string
  author: string
}
export const blogPostData = [
  {
    id: 1,
    title: 'The Art of Vodka: More Than Just a Clear Spirit',
    content:
      'The world of vodka is much more diverse than many people realize, as this clear spirit has a long history and a complex production process. Although it is often categorized as a neutral spirit, the small details in how it is made can significantly change the final product.',
    image: '/images/vodka.jpg',
    date: '16/04/2026',
    author: 'Steve Vetsikas',
  },
  {
    id: 2,
    title: 'Whiskey: Heritage and Craft in a Cask',
    content:
      'Whiskey is a complex spirit crafted from the distillation of fermented grain mash—such as barley, corn, rye, or wheat—and characterized by its essential aging process in wooden oak casks. This time spent in the barrel is what transforms the clear distillate into a rich, amber liquid, infusing it with deep notes of vanilla, oak, and spice. From the smoky and peaty profiles of Scottish malts to the sweet, corn-based heritage of American bourbon, the spirit’s final character is dictated by its geographical origin, the local water source, and the specific duration of maturation.',
    image: '/images/whisky.webp',
    date: '17/04/2026',
    author: 'Steve Vetsikas',
  },
  {
    id: 3,
    title: 'Wine: From Vineyard to Glass',
    content:
      'Wine is an ancient and diverse beverage produced through the fermentation of crushed grapes, where natural yeasts convert the fruit’s sugars into alcohol. Unlike spirits, wine is not distilled, allowing the unique characteristics of the soil, climate, and grape variety—collectively known as terroir—to remain at the forefront of its flavor profile. The process varies from the immediate bottling of fresh whites to the extensive oak-barrel aging of complex reds, which adds structure and tannins. Beyond the classic red and white varieties, the world of wine includes rosés, sparkling options like Champagne, and fortified styles, each offering a different balance of acidity, sweetness, and aroma.',
    image: '/images/wine.webp',
    date: '18/04/2026',
    author: 'Steve Vetsikas',
  },
] as BlogPostType[]
export default function BlogPage() {
  return (
    <div className="flex flex-col gap-6 p-5">
      <h1 className="text-5xl text-center">Blog</h1>
      <div className="flex justify-around gap-5 flex-wrap">
        {blogPostData.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
