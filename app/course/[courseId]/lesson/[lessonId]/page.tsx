
import { getChapter } from "@/actions/getChapters";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import LessonVideo from "./_components/LessonVideo";
import { Button } from "@/components/ui/button";
import { priceFormatter } from "../../../../../lib/price-formatter";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

import CourseAttachments from "./_components/CourseAttachments";
import BuyButton from "./_components/BuyButton";
import { db } from "@/lib/db";
import CompleteLesson from "./_components/CompleteLesson";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Computer } from "lucide-react";
import Glitter from "@/components/Glitter";
import { getProgress } from "@/actions/getProgress";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

import { v4 as uuidv4 } from 'uuid';

interface lessonProps {
  params: {
    courseId: string;
    lessonId: string;
  };
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

let pdfurl: Attachment[] = [];
let yturl: Attachment[] = [];
let simplilearn: Attachment[] = [];
let udamy: Attachment[] = [];

const Lesson = async ({ params }: lessonProps) => {
  const { userId } = auth();

  if (!userId) {
    return console.log("no user");
  }

  const {
    chapter,
    course,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = await getChapter({
    userId,
    courseId: params.courseId,
    chapterId: params.lessonId,
  });

  if (chapter != null && chapter.title != null) {

    const optionspdf = {
      method: 'GET',
      url: 'https://google-web-search1.p.rapidapi.com/',
      params: {
        query: chapter.title + 'filetype:pdf',
        limit: '2',
        related_keywords: 'true'
      },
      headers: {
        'X-RapidAPI-Key': '5c9a287956mshfa1cbf9072c01f0p10e74cjsnef3d1a887f1e',
        'X-RapidAPI-Host': 'google-web-search1.p.rapidapi.com'
      }
    };

    const optionsyt = {
      method: 'GET',
      url: 'https://google-web-search1.p.rapidapi.com/',
      params: {
        query: chapter.title + 'filetype:youtube',
        limit: '2',
        related_keywords: 'true'
      },
      headers: {
        'X-RapidAPI-Key': '5c9a287956mshfa1cbf9072c01f0p10e74cjsnef3d1a887f1e',
    'X-RapidAPI-Host': 'google-web-search1.p.rapidapi.com'
      }
    };

    const optionsmlearn = {
      method: 'GET',
      url: 'https://google-web-search1.p.rapidapi.com/',
      params: {
        query: chapter.title + 'site:simplilearn.com',
        limit: '3',
        related_keywords: 'true'
      },
      headers: {
        'X-RapidAPI-Key': '5c9a287956mshfa1cbf9072c01f0p10e74cjsnef3d1a887f1e',
        'X-RapidAPI-Host': 'google-web-search1.p.rapidapi.com'
      }
    };

    const optionudamy = {
      method: 'GET',
      url: 'https://google-web-search1.p.rapidapi.com/',
      params: {
        query: chapter.title + 'site:udemy.com',
        limit: '3',
        related_keywords: 'true'
      },
      headers: {
        'X-RapidAPI-Key': '5c9a287956mshfa1cbf9072c01f0p10e74cjsnef3d1a887f1e',
    'X-RapidAPI-Host': 'google-web-search1.p.rapidapi.com'
      }
    };

    try {
      const respdf = await axios.request(optionspdf);
      const resyt = await axios.request(optionsyt);
      const ressmlearn = await axios.request(optionsmlearn);
      const resudamy = await axios.request(optionudamy);

      const urilistpdf: Attachment[] = respdf.data.results.map((result: any, index: number) => ({
        id: `pdf_${index}`,
        name: `${result.title.substring(0, 15)}`,
        url: result.url,
        courseId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      pdfurl = urilistpdf;

      const urilistyt: Attachment[] = resyt.data.results.map((result: any, index: number) => ({
        id: `yt_${index}`,
        name: `${result.title.substring(0, 15)}`,
        url: result.url,
        courseId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      yturl = urilistyt;

      const urilistsmlearn: Attachment[] = ressmlearn.data.results.map((result: any, index: number) => ({
        id: `yt_${index}`,
        name: `${result.title}`,
        url: result.url,
        courseId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      simplilearn = urilistsmlearn;


      const uriudmay: Attachment[] = resudamy.data.results.map((result: any, index: number) => ({
        id: `yt_${index}`,
        name: `${result.title}`,
        url: result.url,
        courseId: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      udamy = uriudmay;

    } catch (error) {
      console.error(error);
    }
  }

  if (!chapter || !course) {
    return redirect("/");
  }
  const isLocked = !purchase;
  const isFree = !chapter.isFree;
  const userProgressCount = await getProgress(userId, params.courseId);

  return (
    <div>
      {userProgressCount === 100 ? (
        <Alert className="bg-green-500">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-white" />
            <AlertDescription className="text-white">
              Congratulation 🥳 This course is completed .
            </AlertDescription>
            <Glitter isConfettiActive={userProgressCount === 100} />
          </div>
        </Alert>
      ) : <></>}


      {/* {isLocked && (
        <Alert>
          <div className="flex items-center space-x-2">
            <AlertTriangle size={16} className="text-blue-700" />
            <AlertDescription>
              This Course is not Purchased. It will not be visible in the
              Progress Section.
            </AlertDescription>
          </div>
        </Alert>
      )} */}

      <div>
        <div className="p-4">
          <LessonVideo
            lessonId={params.lessonId}
            title={chapter.title}
            courseId={params.courseId}
            nextChapterId={nextChapter?.id!}
            lesson={chapter}
            isLocked={isLocked}
            isFree={isFree}
          />
        </div>

        <div className="text-center mx-5 lg:flex mb-4 lg:mb-3 lg:item-center lg: justify-between space-2">
          <h3 className="text-slate-700 font-semibold text-xl">
            {chapter.title}
          </h3>

          {/* {isLocked && isFree ? (
            <BuyButton
              isLocked={isLocked}
              coursePrice={course.price!}
              courseId={params.courseId}
            />
          ) : !isLocked ? (
            <>
              {" "}
              <CompleteLesson
                courseId={params.courseId}
                lessonId={params.lessonId}
                isCompleted={!!userProgress?.isCompleted}
                nextChapterId={nextChapter?.id}
              />
            </>
          ) : (
            <>
              <BuyButton
                isLocked={isLocked}
                coursePrice={course.price!}
                courseId={params.courseId}
              />
            </>
          )} */}

        </div>

        {/* {!isLocked &&
          (<div className="m-5 mb-2 mt-0">
            <span className="text-slate-800 text-sm font-bold"> Chapter Status :</span>  {userProgress?.isCompleted ? (
              <Badge variant="secondary">Completed</Badge>
            ) : <Badge variant="destructive">Not completed</Badge>}
          </div>)
        } */}

        <Separator />
        <div className="flex flex-row">
          {attachments && (
            <div className="p-4">
              <h4 className="font-semibold text-indigo-500">Attachments</h4>
              <CourseAttachments attachments={attachments} />
            </div>
          )}
          {pdfurl && (
            <div className="p-4">
              <h4 className="font-semibold text-indigo-500">PDF</h4>
              <CourseAttachments attachments={pdfurl} />
            </div>
          )}
          {yturl && (
            <div className="p-4">
              <h4 className="font-semibold text-indigo-500">You Tube</h4>
              <CourseAttachments attachments={yturl} />
            </div>
          )}
        </div>
        <Separator />
        <div className="flex flex-row">
          {simplilearn && (
            <div className="p-4">
              <h4 className="font-semibold text-indigo-500">Simplilearn</h4>
              <CourseAttachments attachments={simplilearn} />
            </div>
          )}
          {udamy && (
            <div className="p-4">
              <h4 className="font-semibold text-indigo-500">Udamy</h4>
              <CourseAttachments attachments={udamy} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
