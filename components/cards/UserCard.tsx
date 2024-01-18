"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getImageData, getRes } from "@/lib/s3";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getChatBySenderAndReceiver, sendMessage } from "@/lib/actions/chat.actions";
import { getDateTime } from "@/lib/utils";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  type: string;
  postId: string | null
  sender: string | null
}



function UserCard({ id, name, username, imgUrl, type, postId, sender}: Props) {
  const [img, setImg] = useState("/assets/imgloader.svg")
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [send, setSend] = useState(false);

  useEffect(()=> {
    const loadProfile = async ()=> {
    setImg(await getRes(imgUrl))
    }

    loadProfile()
    
  }, [])
  
  //Function that shares post with a User
  const sharePost = async () => {
    setLoading(true)

    if(send)
    {
      alert("Post was already shared!")
      return
    }

    if(sender)
    {
      const getChat = await getChatBySenderAndReceiver(sender, id);

      const timestamp = getDateTime();
      
      let chatMessages = []
      
      if(getChat)
      {
         chatMessages = getChat.messages
      }

      const shareText = `Check Out This Post! https://sparkify.vercel.app/post/${postId}`

      const newMessages = [
        ...chatMessages,
        { text: shareText, sender: sender, receiver: id, timestamp: timestamp },
      ]

      const didSend = await sendMessage(shareText, sender, timestamp, id, newMessages, "/");

      if(didSend)
      {
        setSend(true)
        setLoading(false)
      }
    }else{
      setLoading(false)
      alert("Error Sharing Post Please Try Again")
    }
    
  }

  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image
            src={img}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
          />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className={`text-base-semibold text-primary-500`}>{name}</h4>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      {type === "search" && (<Button
        className='user-card_btn'
        onClick={() => {
            router.push(`/profile/${id}`);
          
        }}
      >
        View
      </Button>)}

      { type === "share" && (
        <Button
        className='user-card_share'
        onClick={sharePost}
      >
        {!loading && !send &&(
          <p className="mx-auto">Share</p>
        )}

        {loading && (
          <Image
            src={"/assets/postloader.svg"}
            alt="loading share"
            width={24}
            height={24}
            className="object-contain mx-auto"
          />
        )}

        {!loading && send && (
          <Image 
            src={"/assets/checkmark.svg"}
            alt="checkmark"
            width={24}
            height={24}
            className="object-contain mx-auto"
          />
        )
        }


      </Button>)
      }
      
    </article>
  );
}

export default UserCard;