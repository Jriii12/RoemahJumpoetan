'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  MapPin,
  Newspaper,
  Pencil,
  Shield,
  User,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  gender?: 'male' | 'female';
};

function Sidebar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const getInitials = () => {
    if (userProfile) {
      const { firstName, lastName } = userProfile;
      return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
    }
    return '';
  };

  const navItems = [
    { icon: User, label: 'Profil', active: true },
    { icon: MapPin, label: 'Alamat' },
    { icon: Shield, label: 'Ubah Password' },
  ];

  const secondaryNav = [
    { icon: Newspaper, label: 'Pesanan Saya' },
    { icon: Bell, label: 'Notifikasi' },
  ];

  return (
    <Card className="w-full md:w-64 flex-shrink-0 bg-card/30 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-6">
          {isLoading ? (
            <Skeleton className="h-12 w-12 rounded-full" />
          ) : (
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-grow">
            {isLoading ? (
              <div className='space-y-2'>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <>
                <p className="font-bold">{userProfile?.firstName}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary cursor-pointer">
                  <Pencil className="h-3 w-3" />
                  <span>Ubah Profil</span>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="font-semibold text-sm mb-2 px-2">Akun Saya</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? 'secondary' : 'ghost'}
              className="justify-start gap-3 px-2"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
        <Separator className="my-4" />
        <nav className="flex flex-col gap-1">
          {secondaryNav.map((item, index) => (
            <Button key={index} variant="ghost" className="justify-start gap-3 px-2">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}

export default function AccountPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (user && firestore) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | undefined>();

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setGender(userProfile.gender);
    }
  }, [userProfile]);

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
      // Here you would typically handle the file upload process
      // For example, upload to Firebase Storage and update the user's photoURL
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef || !firestore) return;

    const updatedData = {
      firstName,
      lastName,
      phoneNumber,
      gender,
    };

    setDoc(userDocRef, updatedData, { merge: true })
      .then(() => {
        toast({
          title: 'Data berhasil diperbarui',
        });
      })
      .catch((error) => {
         const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="container py-8 md:py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar />
        <div className="flex-grow">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Profil Saya
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun.
              </p>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-12">
                <form onSubmit={handleSave} className="flex-grow space-y-6 max-w-lg">
                  {isLoading ? (
                    <div className='space-y-6'>
                        <div className="flex items-center">
                            <Skeleton className="h-4 w-24 mr-4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="flex items-center">
                            <Skeleton className="h-4 w-24 mr-4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="flex items-center">
                            <Skeleton className="h-4 w-24 mr-4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">
                          Nama Depan
                        </Label>
                        <div className="col-span-3">
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">
                          Nama Belakang
                        </Label>
                        <div className="col-span-3">
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">
                          Email
                        </Label>
                        <div className="col-span-3 flex items-center">
                          <span className="flex-grow">{userProfile?.email}</span>
                          <Button variant="link" className="text-accent h-auto p-0">Ubah</Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">
                          Telepon
                        </Label>
                        <div className="col-span-3">
                           <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder='Tambahkan nomor telepon'
                          />
                        </div>
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-muted-foreground">
                          Jenis Kelamin
                        </Label>
                        <div className="col-span-3">
                          <RadioGroup value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')} className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Laki-laki</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Perempuan</Label>
                            </div>
                           </RadioGroup>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                         <div className="col-span-1"></div>
                         <div className="col-span-3">
                            <Button type="submit" className="rounded-full bg-accent hover:bg-accent/80">Simpan</Button>
                         </div>
                      </div>
                    </>
                  )}
                </form>
                <div className="flex-shrink-0 w-full md:w-56 flex flex-col items-center">
                   <Avatar className="h-28 w-28 mb-4">
                      {userProfile && <AvatarImage src={user?.photoURL || undefined} />}
                      <AvatarFallback className="text-4xl">{userProfile ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}` : 'U'}</AvatarFallback>
                    </Avatar>
                  <Button variant="outline" className='mb-2' onClick={handleFileSelectClick}>Pilih Gambar</Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground text-center">Ukuran file: maks. 1 MB</p>
                  <p className="text-xs text-muted-foreground text-center">Format file: .JPEG, .PNG</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    