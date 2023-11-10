import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import Post from "@/components/shared/Post";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchPostById } from "@/lib/actions/post.actions";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;


  console.log("PARAMS ID:", params.id)

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

 const post = await fetchPostById(params.id);

 if(post)  console.log("POST FOUND: ", post)


  return (
    <section className='relative'>
      <div>
            <Post
                key={post.idpost}
                id={post.idpost}
                currentUserId={user.id}
                parentId={post.parent_id}
                content={post.content}
                createdAt={post.created_at}
                comments={post.children}
                image={post.author.image}
                username={post.author.username}
              />
      </div>

      <div className='mt-7'>
        <Comment
          postId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={userInfo.id}
        />
      </div>

      <div className='mt-10'>
        {post.children?.map((childItem: any) => (
          <Post
            key={childItem.idpost}
            id={childItem.idpost}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.content}
            username={post.author.username}
            // author={childItem.author}
            image={childItem.image}
            createdAt={childItem.createdAt}
            comments={childItem.children? childItem.children : []}
            isComment = {true}
          />
        ))}
      </div>
    </section>
  );
}

export default page;