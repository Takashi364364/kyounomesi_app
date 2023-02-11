import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { auth } from "../firebase";
import "../fontStyled.css";

const DrawerMenu = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <HStack bg={"green.200"}>
        <Button m={"2"} bg={"green.200"} onClick={onOpen} ref={btnRef}>
          <GiHamburgerMenu size={"20"} />
        </Button>
        <Box fontSize={"4xl"} className={"title-font"} color={"yellow.100"}>
          きょうのメシ
        </Box>
      </HStack>

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <Button
                bg={"white"}
                onClick={async () => {
                  await auth.signOut();
                }}
              >
                ログアウト
              </Button>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
};

export default DrawerMenu;
