import {
  Avatar,
  Box,
  Button,
  HStack,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, db } from "../firebase";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { MdAddAPhoto } from "react-icons/md";

const FoodInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useSelector(selectUser);
  const [foodName, setFoodName] = useState("");
  const [foodImage, setFoodImage] = useState<File | null>(null);
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setFoodImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  const onClickButton = () => {
    inputRef.current?.click();
  };

  const sendFood = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (foodImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + foodImage.name;
      const uploadFoodImage = uploadBytesResumable(
        ref(storage, `images/${fileName}`),
        foodImage
      );
      uploadFoodImage.on(
        "state_changed",
        () => {},
        (err) => {
          alert(err.message);
        },
        async () => {
          await getDownloadURL(ref(storage, `images/${fileName}`)).then(
            async (url) => {
              addDoc(collection(db, "posts"), {
                avatar: user.photoUrl,
                image: url,
                text: foodName,
                timestamp: serverTimestamp(),
                username: user.displayName,
              });
            }
          );
        }
      );
    }
    setFoodName("");
    setFoodImage(null);
  };

  return (
    <HStack
      overflow={"hidden"}
      justifyContent={"center"}
      backgroundColor={"green.200"}
      mt={"-5"}
    >
      <form onSubmit={sendFood}>
        <HStack p={7} spacing={{ sm: "2" }}>
          <Avatar shadow={"md"} cursor={"pointer"} src={user.photoUrl} />
          <Input
            w={{ md: "500px" }}
            bg={"white"}
            rounded={"full"}
            shadow={"md"}
            placeholder="今日は何食べた?"
            type="text"
            autoFocus
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
          <Box>
            <Input
              type="file"
              ref={inputRef}
              hidden
              onChange={onChangeImageHandler}
            />
            <IconButton
              bg={"green.200"}
              aria-label="Input_image"
              onClick={onClickButton}
              icon={
                <MdAddAPhoto
                  color={foodImage ? "#65686E" : "#3182CE"}
                  size={"35"}
                />
              }
            />
          </Box>
          <Button
            shadow={"lg"}
            rounded={"full"}
            colorScheme={"blue"}
            type="submit"
            disabled={!foodImage}
          >
            投稿
          </Button>
        </HStack>
      </form>
    </HStack>
  );
};

export default FoodInput;
