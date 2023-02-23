import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  Avatar,
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { BiMessage } from "react-icons/bi";
import {
  doc,
  addDoc,
  collection,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";

interface PROPS {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const Post: React.FC<PROPS> = (props) => {
  const user = useSelector(selectUser);

  const {
    isOpen: isImageModalOpen,
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      username: "",
      timestamp: null,
    },
  ]);

  //コメント一覧を表示
  useEffect(() => {
    const q = query(
      collection(db, "posts", props.postId, "comments"),
      orderBy("timestamp", "desc")
    );
    const unSub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          username: doc.data().username,
          timestamp: doc.data().timestamp,
        }))
      );
    });
    return () => {
      unSub();
    };
  }, [props.postId]);

  //新規コメントを投稿
  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addDoc(collection(db, "posts", props.postId, "comments"), {
      avatar: user.photoUrl,
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    setComment("");
  };

  //投稿を削除
  const deletePost = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const postDocumentRef = doc(db, "posts", props.postId);

    await deleteDoc(postDocumentRef);
  };

  return (
    <Stack bg={"#EBEBF1"}>
      <HStack key={props.postId} pt={"10"} justify={"center"}>
        <Avatar src={props.avatar} /> {/* アバターアイコン */}
        <HStack display={{ base: "inline-block", md: "flex" }}>
          <Box>@{props.username}</Box> {/* ユーザー名 */}
          <Box pt={{ base: "3px", md: "0" }}>
            {new Date(props.timestamp?.toDate()).toLocaleString()}
          </Box>
          {/* 投稿日時 */}
        </HStack>
        {/* ログインユーザーと投稿ユーザーが一致すれば削除 */}
        {user.displayName === props.username ? (
          <>
            <Button
              size={"sm"}
              colorScheme={"blue"}
              onClick={onDeleteModalOpen}
            >
              削除
            </Button>
            {/* 削除確認用モーダル */}
            <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>削除しますか？</ModalHeader>
                <ModalBody>
                  <Button
                    colorScheme={"gray"}
                    mr={3}
                    boxShadow={"md"}
                    onClick={onDeleteModalClose}
                  >
                    やめる
                  </Button>
                  <Button
                    colorScheme={"blue"}
                    boxShadow={"lg"}
                    onClick={deletePost}
                  >
                    削除する
                  </Button>
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        ) : null}
      </HStack>
      <VStack>
        <Box m={"15"}>{props.text}</Box> {/* テキスト */}
        {/* 画像 */}
        {props.image && (
          <>
            <Image
              rounded={"20"}
              boxShadow={"lg"}
              h={{ base: "150", md: "400" }}
              w={"500"}
              src={props.image}
              alt={"food"}
              onClick={onImageModalOpen}
            />
            <Modal
              isOpen={isImageModalOpen}
              onClose={onImageModalClose}
              size={{ base: "md", md: "lg" }}
            >
              {/* 画像モーダル */}
              <ModalOverlay>
                <ModalContent>
                  <Image src={props.image} />
                </ModalContent>
              </ModalOverlay>
            </Modal>
          </>
        )}
        {/* コメント一覧開閉アイコン */}
        <Box pr={"60"}>
          <IconButton
            aria-label="OpenCommentsIcon"
            icon={<BiMessage size={"40"} color={"#717173"} />}
            bg={"#EBEBF1"}
            onClick={() => setOpenComments(!openComments)}
          />
        </Box>
        {/* コメント表示一覧 */}
        {openComments && (
          <>
            {comments.map((com) => (
              <VStack key={com.id}>
                <HStack>
                  <Avatar src={com.avatar} size={"sm"} />
                  <Box>@{com.username}</Box>
                  <Box>
                    {new Date(com.timestamp?.toDate()).toLocaleString()}
                  </Box>
                </HStack>
                <Box pr={"24"}>{com.text}</Box>
              </VStack>
            ))}

            {/* 新規コメントを投稿 */}
            <form onSubmit={newComment}>
              <HStack h={"20"} justify={"center"}>
                <Input
                  type={"text"}
                  w={"200"}
                  boxShadow={"md"}
                  bg={"blackAlpha.200"}
                  placeholder={"コメント入力欄"}
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <Button
                  aria-label="Send-Comment"
                  disabled={!comment}
                  type={"submit"}
                  boxShadow={"md"}
                  colorScheme={"blue"}
                >
                  投稿
                </Button>
              </HStack>
            </form>
          </>
        )}
      </VStack>
    </Stack>
  );
};

export default Post;
