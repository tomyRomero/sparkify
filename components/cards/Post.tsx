"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getImageData } from "@/lib/s3";
import { addLikeToPost, removeLikeFromPost } from "@/lib/actions/post.actions";
import DeletePost from "../forms/DeletePost";
import { fetchUser } from "@/lib/actions/user.actions";
import { useAppContext } from "@/lib/AppContext";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
  image: string;
  username: string;
  likes: string;
  authorId: string;
  contentImage?: string
  title: string;
}

function Post({
  id,
  currentUserId,
  parentId,
  content,
  createdAt,
  comments,
  isComment,
  image,
  username, 
  likes,
  authorId,
  contentImage,
  title
}: Props) {


    const isInsideLikes = () => {
        // Split the comma-separated string into an array
      const userIdsArray = likes.split(',');
      // Check if the userIdToCheck is in the array
      return userIdsArray.includes(currentUserId);
    }

    const filterLikes = () => {
      // Remove trailing comma and split the string by commas
      //@ts-ignore
      const valuesArray = likes.slice(0, -1).split(',');
      // Filter out empty strings and get the count
      //@ts-ignore
      const numberOfLikes = valuesArray.filter(value => value !== '').length;
      return numberOfLikes
    }

    const [img, setImg] = useState('/assets/imgloader.svg');
    const [like, setLike] = useState(isInsideLikes());
    const [commentImgs, setCommentImgs] = useState(['/assets/imgloader.svg', '/assets/imgloader.svg'])
    const [floatingHearts, setFloatingHearts] = useState(false);
    const [numLikes, setNumLikes] = useState(filterLikes())
    const [contentImg, setContentImg] = useState('/assets/postloader.svg')

    const {setNewLike, newLike} = useAppContext();

    useEffect(() => {
      const loadProfile = async () => {
        try {
          let imgResult = '/assets/profile.svg';
          if (image.startsWith('user')) {
            const res = await getImageData(image);
            imgResult = res;
          } else {
            imgResult = image;
          }
    
          setImg(imgResult);
        } catch (error) {
          setImg('/assets/profile.svg');
          console.log("Error", error);
        }
      };
    
      const loadCommentImg = async () => {
        // Logic to Set the Images of the Comments, using an Array so that it can load when we map them.
        const imgArray = [];
        try {
          for (let index = 0; index < 2; index++) {
            const element = comments[index];
            //@ts-ignore
            if (element && element.image) {
              //@ts-ignore
              const img = element.image;
              if (img.startsWith('user')) {
                const res = await getImageData(img);
                imgArray.push(res ? res : '/assets/profile.svg');
              } else {
                imgArray.push(img);
              }
            }
          }
        } catch (error) {
          console.log("Error setting comment Image", error);
        }
    
        setCommentImgs(imgArray);
      };
    
      const loadContentImage = async () => {
        try {
          let contentResult = '/assets/failed.svg';
          //@ts-ignore
          if (contentImage?.length > 0 && contentImage?.startsWith('user')) {
            const content = await getImageData(contentImage);
            contentResult = content ? content : '/assets/failed.svg';
          }else{
            //@ts-ignore
            if(contentImage?.length > 0)
            {
              //@ts-ignore
              contentResult = contentImage
            }
          }
    
          setContentImg(contentResult);
        } catch (error) {
          console.log("Error Getting Content Image:", error);
          setContentImg('/assets/failed.svg');
        }
      };
    
      const load = async () => {
        await Promise.all([
          loadProfile(),
          loadCommentImg(),
          loadContentImage()
        ]);
      }
      // Execute the functions
      load();
    }, [comments]);
    
      const handleLikeClick = async () => {
        // Like logic here
        setLike(!like);

        setFloatingHearts(true)

        try{
        // Toggle the like status in the database
          if (like) {
            await removeLikeFromPost(id, currentUserId);
            setNumLikes(prevNumLikes => prevNumLikes - 1);
          } else {
            await addLikeToPost(id, currentUserId);
            setNumLikes(prevNumLikes => prevNumLikes + 1);

            //Adjust global state for notifactions
            setNewLike(!newLike)
          }

        // After a short delay (e.g., 500ms)
        setTimeout(() => setFloatingHearts(false), 500);
        
        }catch (error) {
          console.log("Error in Liking Post", error);
          alert("Error In Server, Unable To Like/Unlike");
        }
      };

     const filterComments = ()=> {
        // Since children are stored in database as an string "1,2,3,4" of IDs they dont get populated
        // Only if a query is ran however we only run the query for the main post so we have to manually figure out number of children based 
        // off the string, we read the length of comments directly we be returned the legnth of the string and we dont want that
        if(isComment)
        {
          // Remove trailing comma and split the string by commas
          //@ts-ignore
          const valuesArray = comments.slice(0, -1).split(',');

          // Filter out empty strings and get the count
          //@ts-ignore
          const numberOfComments = valuesArray.filter(value => value !== '').length;
          
          return numberOfComments
        }
     }

     const floatingHeartsClass = like ? "floating-hearts active" : "floating-hearts";

     function extractTitle(inputString: string): string {
      const titleMatch = inputString.match(/Title:([\s\S]*?)(Synopsis:|$)/i);
      return titleMatch ? titleMatch[1].trim() : '';
    }
    
    function extractSynopsis(inputString: string): string {
      const synopsisMatch = inputString.match(/Synopsis:([\s\S]*)/i);
      return synopsisMatch ? synopsisMatch[1].trim() : '';
    }
    

  return (
    <article className={`${isComment? '' : 'bg-black border-solid border-2 border-primary-500 rounded-xl'}`}>
    <div
      className={`flex w-full flex-col ${
        isComment ? "px-0 xs:px-7" : "p-5"
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${authorId}`} className='relative h-11 w-11'>
              <Image
                src={img}
                alt='user_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>

            <div className='card_bar' />
          </div>

          <div className='flex w-full flex-col'>
            <Link href={`/profile/${authorId}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {username}
              </h4>
            </Link>

            {/* Content For Regular*/}
            {title === 'Regular' && (
              <div>
              <p className='mt-2 text-small-regular text-light-2 ml-3 overflow-y-auto max-h-30'
              >{content}</p>
              {content.length > 200 && (
                  <div className="">
                  <p className="text-primary-500 mt-2 ml-3 text-tiny-medium">Scroll For More &darr;</p>
                  </div>
              )}

            <Image
            src={contentImg}
            alt={"postImage"}
            width={250}
            height={150}
            className={`${
              //@ts-ignore
              contentImage?.length > 0 && title !== "Comment" ? 'mt-4 object-contain rounded-md ml-3':'hidden'}`}
            />
              </div>
            )}
            
             {/* Content For Comment*/}
            {title === 'Comment' && (
              <div>
              <p className='mt-2 text-small-regular text-light-2 ml-3 overflow-y-auto max-h-30'
              >{content}</p>
              {content.length > 200 && (
                  <div className="">
                  <p className="text-primary-500 mt-2 ml-3 text-tiny-medium">Scroll For More &darr;</p>
                  </div>
              )}

            <Image
            src={contentImg}
            alt={"postImage"}
            width={250}
            height={150}
            className={`${
              //@ts-ignore
              contentImage?.length > 0 && title !== "Comment" ? 'mt-4 object-contain rounded-md ml-3':'hidden'}`}
            />
              </div>
            )}

            {/* Content for Sparks */}
            {title !== 'Comment' && title !== "Regular" && (
              <div>
              <h1 className="mt-2 text-heading3-bold text-light-1 ml-3"><span className="text-primary-500"></span> {extractTitle(content)}</h1>
              <p className={`${title === 'Artwork Spark' || title === "Fashion Spark" || title === "Photography Spark" ? 'hidden' : 'mt-2 text-heading3-semibold text-primary-500 ml-3'}`}
              >{`${title === "Movie Spark" || title === "Novel Spark" ? 'Synopsis:' : 'Content:'}`}</p>
              <p className={`${title === 'Artwork Spark' || title === "Fashion Spark" || title === "Photography Spark" ? 'hidden' : 'mt-2 text-base-regular text-light-2 ml-3 overflow-y-auto max-h-48'}`}>{extractSynopsis(content)}</p>
              {content.length > 300 && (
                  <div className={`${title === 'Artwork Spark' || title === "Fashion Spark" || title === "Photography Spark" ? 'hidden' : ''}`}>
                  <p className="text-primary-500 mt-2 ml-3.5 text-tiny-medium">Scroll For More &darr;</p>
                  </div>
              )}

            <Image
            src={contentImg}
            alt={"postImage"}
            width={250}
            height={150}
            className={`${
              //@ts-ignore
              contentImage?.length > 0 && title !== "Comment" ? 'mt-4 object-contain rounded-md ml-3':'hidden'}`}
            />
              </div>
            )}

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className='flex gap-3.5'>
                <Image
                  src={`${like? '/assets/like.svg' : '/assets/unlike.svg'  }`}
                  alt='heart'
                  width={24}
                  height={24}
                  className={`cursor-pointer object-contain ${like ? 'pop-animation active' : 'pop-animation'}`}
                  onClick={() => {handleLikeClick()}}
                />
                <Link href={`/post/${id}`}>
                  <Image
                    src='/assets/uncomment.svg'
                    alt='comment'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </Link>
                <Image
                  src='/assets/share.svg'
                  alt='share'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain'
                />
                  {/* Title */}
                <div className={`${title !=="Regular" && title !== "Comment" ? '' : 'hidden'} `}>
                    <h1 className="text-base-semibold teal_gradient cursor-pointer hover:text-light-1 ml-2  max-sm:hidden">{title}</h1>
                </div>
              </div>
              <h1 className={`${title !=="Regular" && title !== "Comment" ? '' : 'hidden'} text-base-semibold teal_gradient cursor-pointer hover:text-light-1 sm:hidden`}>{title}</h1>
              <p className="text-subtle-medium text-white">{createdAt}</p>

               {/* If there is likes render this for the comments*/}
               <div className=" flex gap-2 flex-row">
               {isComment && numLikes > 0 && (
                  <p className='mt-1 text-subtle-medium text-white'>
                    {numLikes} lik{numLikes > 1 ? "es" : "e"}
                  </p>
              )}

              { isComment && comments?.length > 0 && (
                <Link href={`/post/${id}`}>
                  <p className='mt-1 text-subtle-medium text-white'>
                    {filterComments()} repl{filterComments() > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
               </div>   

            </div>
          </div>
        </div>
      
        <DeletePost
          postId={id}
          currentUserId={currentUserId}
          authorId={authorId}
          parentId={parentId}
          isComment={isComment}
        />
        
      </div>

      <div className="flex flex-row gap-2 transition-all duration-300 ease-in-out">
      {!isComment && comments?.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={commentImgs[index]}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))} 
          <Link href={`/post/${id}`}>
            <p className='mt-1 text-subtle-medium text-white'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && numLikes > 0 && (
                  <p className='mt-4 text-subtle-medium text-white self-center'>
                    {numLikes} lik{numLikes > 1 ? "es" : "e"}
                  </p>
              )}
      </div>


       {/* Render the floating hearts */}
       <div className={`relative ${floatingHearts? '': 'hidden'}`}>
        {like && (
          <div className={`floating-heart`}>❤️</div>
        )}
      </div>

      </div>
    </article>
  );
}

export default Post;
