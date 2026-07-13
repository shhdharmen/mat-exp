import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-community-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, MatIconButton, MatIcon],
  templateUrl: './community-dialog.component.html',
  styleUrl: './community-dialog.component.scss',
})
export class CommunityDialogComponent {
  githubRepoUrl = environment.githubRepoUrl;
}
