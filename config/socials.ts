import { Icons } from "@/components/common/icons";

interface SocialInterface {
  name: string;
  username: string;
  icon: any;
  link: string;
}

export const SocialLinks: SocialInterface[] = [
  {
    name: "Github",
    username: "@RMSULTAN256",
    icon: Icons.gitHub,
    link: "https://github.com/RMSULTAN256",
  },
  {
    name: "LinkedIn",
    username: "Rm Sultan Arif Syaidinah Hadi",
    icon: Icons.linkedin,
    link: "https://linkedin.com/in/rmsultan",
  },
  {
    name: "Instagram",
    username: "rms_256",
    icon: Icons.instagram,
    link: "https://instagram.com/rms_256",
  },
  {
    name: "Gmail",
    username: "rmsultanarif256@gmail.com",
    icon: Icons.gmail,
    link: "mailto:rmsultanarif256@gmail.com",
  },
];
