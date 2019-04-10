import { Component, OnDestroy, OnInit } from "@angular/core";
import { PostModel } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: PostModel[] = [];
  isLoading = false;
  private postsSub: Subscription;
  totalPosts = 0;
  postsPerPage = 25;
  pageSizeOptions = [10, 25, 50, 75];
  currentPage = 1;
  currentCategory = "all";
  categories = [
    { label: "All", name: "all" },
    { label: "Symbols", value: "symbols" },
    { label: "People", name: "people" },
    { label: "Archaeology", name: "archaeology" },
    { label: "History", name: "history" },
    { label: "Consciousness", name: "consciousness" },
    { label: "Religon", value: "religon" }
  ];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: string;

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsService.getPosts(
      this.currentCategory,
      this.postsPerPage,
      this.currentPage
    );
    this.postsSub = this.postsService
      .getPostsUpdateListener()
      .subscribe((postData: { posts: PostModel[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(
      this.currentCategory,
      this.postsPerPage,
      this.currentPage
    );
  }

  changeCategory(category) {
    this.currentCategory = category;
    this.postsService.getPosts(category, 5, 1);
  }

  onDelete(id: string) {
    this.postsService.deletePost(id).subscribe(
      () => {
        this.postsService.getPosts(
          this.currentCategory,
          this.postsPerPage,
          this.currentPage
        );
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
