import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../models/profile.model';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  loading = true;
  saving = false;
  deleting = false;
  isEditing = false;
  error = '';
  successMsg = '';
  notFound = false;

  // Form fields (ngModel)
  form = {
    bio: '',
    city: '',
    gender: '' as 'M' | 'F' | 'O' | '',
    birthdate: '',
  };
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private profileService: ProfileService, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';
    this.profileService.getMyProfile().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (p) => {
        this.profile = p;
        this.notFound = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.notFound = true;
        } else {
          this.error = 'Failed to load profile.';
        }
      },
    });
  }

  startEdit(): void {
    if (this.profile) {
      this.form.bio = this.profile.bio;
      this.form.city = this.profile.city;
      this.form.gender = this.profile.gender;
      this.form.birthdate = this.profile.birthdate ?? '';
      this.previewUrl = this.profile.photo_url;
    } else {
      this.form.bio = '';
      this.form.city = '';
      this.form.gender = '';
      this.form.birthdate = '';
      this.previewUrl = null;
    }
    this.selectedFile = null;
    this.isEditing = true;
    this.successMsg = '';
    this.error = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.previewUrl = null;
    this.selectedFile = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.error = '';
    this.successMsg = '';

    const fd = new FormData();
    fd.append('bio', this.form.bio);
    fd.append('city', this.form.city);
    fd.append('gender', this.form.gender);
    if (this.form.birthdate) fd.append('birthdate', this.form.birthdate);
    if (this.selectedFile) fd.append('photo', this.selectedFile);

    const action$ = this.notFound
      ? this.profileService.createProfile(fd)
      : this.profileService.updateProfile(fd);

    action$.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (p) => {
        this.profile = p;
        this.notFound = false;
        this.isEditing = false;
        this.successMsg = 'Profile saved!';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Failed to save profile.';
      },
    });
  }

  deleteProfile(): void {
    if (!confirm('Delete your profile?')) return;
    this.deleting = true;
    this.profileService.deleteProfile().subscribe({
      next: () => {
        this.profile = null;
        this.notFound = true;
        this.deleting = false;
        this.isEditing = false;
      },
      error: () => {
        this.error = 'Failed to delete profile.';
        this.deleting = false;
      },
    });
  }

  // --- Additional Photos Management ---

  uploadExtraPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.profileService.uploadAdditionalPhoto(file).subscribe({
        next: (photo) => {
          if (this.profile) {
            this.profile.additional_photos = this.profile.additional_photos || [];
            this.profile.additional_photos.push(photo);
          }
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to upload photo';
        }
      });
    }
    input.value = ''; // Reset input
  }

  deleteExtraPhoto(photoId: number): void {
    if (!confirm('Delete this photo?')) return;
    this.profileService.deleteAdditionalPhoto(photoId).subscribe({
      next: () => {
        if (this.profile && this.profile.additional_photos) {
          this.profile.additional_photos = this.profile.additional_photos.filter(p => p.id !== photoId);
        }
      },
      error: () => {
        this.error = 'Failed to delete photo';
      }
    });
  }

  setMainPhoto(photoId: number): void {
    this.profileService.setMainPhoto(photoId).subscribe({
      next: (res) => {
        if (this.profile) {
          // Re-load the profile entirely to get the newly updated avatar and new list of additional photos
          this.loadProfile();
        }
      },
      error: (err) => {
        this.error = 'Failed to set main photo';
      }
    });
  }
}
