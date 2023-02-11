import React, { useRef, useState } from "react";
import { auth, provider, storage } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { AiOutlineMail } from "react-icons/ai";
import { FaUserAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  Link,
  Stack,
  Image,
  Box,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";

const Auth: React.FC = () => {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [resetEmail, setResetEmail] = useState("");

  const onClickButton = () => {
    inputRef.current?.click();
  };

  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        onClose();
        setResetEmail("");
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail("");
      });
  };

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0]);
      e.target.value = "";
    }
  };

  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    let url = "";
    if (avatarImage) {
      const S =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + avatarImage.name;

      await uploadBytes(ref(storage, `avatars/${fileName}`), avatarImage);
      url = await getDownloadURL(ref(storage, `avatars/${fileName}`));
    }
    if (authUser) {
      await updateProfile(authUser.user, {
        displayName: username,
        photoURL: url,
      });
    }

    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((err) => alert(err.message));
  };

  const guestSignInButton = async () => {
    return signInWithEmailAndPassword(
      auth,
      "guest@example.com",
      "guestpassword"
    );
  };

  return (
    <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <Heading fontSize={"2xl"}>
            {isLogin ? "ログイン" : "アカウント登録"}
          </Heading>

          <FormControl id="username">
            {!isLogin && (
              <>
                <Input
                  placeholder="ユーザー名"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value);
                  }}
                />
                <Box textAlign={"center"} mt={6}>
                  <Input
                    type="file"
                    ref={inputRef}
                    hidden
                    onChange={onChangeImageHandler}
                  />
                  <IconButton
                    onClick={onClickButton}
                    rounded="full"
                    shadow="lg"
                    colorScheme={avatarImage ? "gray" : "blue"}
                    aria-label="register avatar"
                    icon={<FaUserAlt />}
                  />
                </Box>
              </>
            )}
          </FormControl>

          <FormControl id="email">
            <Input
              placeholder="メールアドレス"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
              }}
            />
          </FormControl>
          <FormControl id="password">
            <Input
              placeholder="パスワード"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />
          </FormControl>
          <Stack spacing={6}>
            <Stack
              direction={{ base: "column", sm: "row" }}
              align={"start"}
              justify={"space-between"}
            >
              <Link color={"blue.500"} onClick={onOpen}>
                パスワードを忘れたら
              </Link>
              <Link color={"blue.500"} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "アカウント新規作成" : "ログイン画面に戻る"}
              </Link>
            </Stack>
            <Button
              colorScheme={"blue"}
              variant={"solid"}
              leftIcon={<AiOutlineMail />}
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !username || !email || password.length < 6 || !avatarImage
              }
              onClick={
                isLogin
                  ? async () => {
                      try {
                        await signInEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
                  : async () => {
                      try {
                        await signUpEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? "ログイン" : "アカウント登録"}
            </Button>
            <Button
              colorScheme={"blue"}
              variant={"solid"}
              onClick={signInGoogle}
              leftIcon={<FcGoogle />}
            >
              Google アカウントでログイン
            </Button>
            <Button colorScheme={"teal"} onClick={guestSignInButton}>
              ゲストユーザーとしてログイン
            </Button>
          </Stack>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Image
          alt={"Login Image"}
          objectFit={"cover"}
          src={
            "https://images.unsplash.com/photo-1614563637806-1d0e645e0940?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80"
          }
        />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>パスワード再設定のメールを送る</ModalHeader>
          <ModalBody>
            <FormControl>
              <Input
                placeholder="メールアドレス"
                type="email"
                value={resetEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setResetEmail(e.target.value);
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme={"blue"} onClick={sendResetEmail}>
              送信
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};
export default Auth;
